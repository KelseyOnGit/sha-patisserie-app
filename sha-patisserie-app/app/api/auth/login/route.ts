import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Your shared Prisma client
import { createSession } from '@/lib/session';
import { verifyPin } from '@/lib/pins';

export async function POST(request: Request) {
  try {
    const { email, pinCode } = await request.json();

    // 1. Validate input presence
    if (typeof email !== 'string' || !email || typeof pinCode !== 'string' || !/^\d{4,6}$/.test(pinCode)) {
      return NextResponse.json(
        { error: 'Email and PIN are required.' },
        { status: 400 }
      );
    }

    // 2. Lookup user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 3. Verify user and PIN
    if (!user || !await verifyPin(pinCode, user.pinCode)) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    //ADD ISAPPROVED CHECK
    if(!user.isApproved) {
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
