import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, pinCode, name} = await request.json();


    if (!email || !pinCode) {
      return NextResponse.json(
        { error: 'Email and PIN code are required.' },
        { status: 400 }
      );
    }

    if (pinCode.length < 4) {
      return NextResponse.json(
        { error: 'PIN code must be at least 4 digits.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    // Create new staff account
    const user = await prisma.user.create({
        data:{
            name:name || email.split('@')[0],
            email,
            pinCode,
        },
    });


    return NextResponse.json(
      { message: 'Account created successfully.', user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create account.' },
      { status: 500 }
    );
  }
}