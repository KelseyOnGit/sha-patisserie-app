import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Best practice: use single shared instance

export async function POST(request: Request) {
  try {
    // 1. Parse the incoming request body
    const body = await request.json();
    const { email, pinCode } = body;

    // 2. Validate input fields BEFORE database queries
    if (!email || !pinCode) {
      return NextResponse.json(
        { error: 'Both "email" and "pinCode" fields are required.' },
        { status: 400 }
      );
    }

    // 3. Query Database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 4. Verify Credentials AFTER database queries
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.pinCode !== pinCode) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 5. Return Success Response
    return NextResponse.json(
      {
        message: 'Authentication successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
