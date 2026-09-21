import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Your shared Prisma client
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email, pinCode } = await request.json();

    // 1. Validate input presence
    if (!email || !pinCode) {
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
    if (!user || user.pinCode !== pinCode) {
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
    });

    return NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
