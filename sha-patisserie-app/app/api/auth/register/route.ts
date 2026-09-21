import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, pinCode, name } = await request.json();

    // 1. Email Presence & Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !email.trim() || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Oops, this email doesn't look right." },
        { status: 400 }
      );
    }

    // 2. PIN Code / Password Strength Validation
    if (!pinCode) {
      return NextResponse.json(
        { error: 'PIN code is required.' },
        { status: 400 }
      );
    }

    // PIN Strength Criteria: Must be 4-6 digits, not sequential (1234), and not repeated (0000)
    const pinRegex = /^\d{4,6}$/;
    const isWeakPin = 
      !pinRegex.test(pinCode) || 
      /^(\d)\1+$/.test(pinCode) || 
      '0123456789'.includes(pinCode) || 
      '9876543210'.includes(pinCode);

    if (isWeakPin) {
      return NextResponse.json(
        { error: 'Please choose a stronger PIN (4-6 digits, avoid easy patterns like 1234 or 0000).' },
        { status: 400 }
      );
    }

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    // 4. Create new staff account with Admin Approval Flag
    const user = await prisma.user.create({
      data: {
        name: name || email.split('@')[0],
        email,
        pinCode,
        isApproved: false, // Requires admin approval before access is granted
      },
    });

    return NextResponse.json(
      { 
        message: 'Registration submitted successfully! Your account is pending admin approval.', 
        user: { id: user.id, email: user.email } 
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create account.' },
      { status: 500 }
    );
  }
}
