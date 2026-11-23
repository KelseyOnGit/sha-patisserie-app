import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Your shared Prisma client
import { createSession } from '@/lib/session';
import { verifyPin } from '@/lib/pins';
import { emailVerificationRequired } from '@/lib/auth-config';

export async function POST(request: Request) {
  let stage = 'validate request';
  try {
    const body = await request.json().catch(() => null);
    const { email, pinCode } = body || {};

    // 1. Validate input presence
    if (typeof email !== 'string' || !email || typeof pinCode !== 'string' || !/^\d{4,6}$/.test(pinCode)) {
      return NextResponse.json(
        { error: 'Email and PIN are required.' },
        { status: 400 }
      );
    }

    // 2. Lookup user in database

    const normalizedEmail = email.trim().toLowerCase();

    stage = 'database lookup';
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    // 3. Verify user and PIN
    stage = 'verify PIN';
    if (!user || !await verifyPin(pinCode, user.pinCode)) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    if (user.status === 'INACTIVE') {
      return NextResponse.json({ error: 'This account is inactive. Contact your manager.' }, { status: 403 });
    }
    if (emailVerificationRequired() && !user.emailVerified) {
      return NextResponse.json(
        { error: 'Verify your email before signing in. Check your inbox or use Resend verification email.' },
        { status: 403 }
      );
    }
    if (!user.isApproved || user.status !== 'ACTIVE') {
      return NextResponse.json(
        {error:'Your account is pending admin approval. Please contact your manager'},
        {status: 403}
      )
    }

    // 4. Create HTTP-Only Cookie Session
    stage = 'create session';
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      { message: 'Login successful', role: user.role },
      { status: 200 }
    );
  } catch (error) {
    const code = error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code :
      error instanceof Error && 'errorCode' in error && typeof error.errorCode === 'string' ? error.errorCode : null;
    const quotaExceeded = stage === 'database lookup' && error instanceof Error &&
      /exceeded the quota|reaching its monthly free plan limit/i.test(error.message);
    const databaseUnavailable = stage === 'database lookup' && (
      quotaExceeded || ['P1001', 'P1002', 'P1008', 'P1017', 'P2024', 'P2037'].includes(code ?? '') ||
      (error instanceof Error && error.name === 'PrismaClientInitializationError')
    );
    // Prisma messages may contain connection details; log only safe diagnostics.
    console.error('Login failed:', {
      stage, code, errorName: error instanceof Error ? error.name : 'UnknownError',
      category: quotaExceeded ? 'database-quota-exceeded' : databaseUnavailable ? 'database-unavailable' : 'unexpected',
    });
    if (databaseUnavailable) {
      return NextResponse.json(
        { error: 'Sign-in is temporarily unavailable because the database is unavailable. Please contact your manager.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
