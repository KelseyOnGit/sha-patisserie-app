import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Your shared Prisma client
import { createSession } from '@/lib/session';
import { verifyPin } from '@/lib/pins';

export async function POST(request: Request) {
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

    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    // 3. Verify user and PIN
    if (!user || !await verifyPin(pinCode, user.pinCode)) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    if (user.status === 'INACTIVE') {
      return NextResponse.json({ error: 'This account is inactive. Contact your manager.' }, { status: 403 });
    }
    if (!user.emailVerified) {
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
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      { message: 'Login successful', role: user.role },
      { status: 200 }
    );
  } catch {
    console.error('Login failed.');
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
