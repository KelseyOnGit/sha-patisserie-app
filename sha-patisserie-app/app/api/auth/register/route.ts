import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPin } from '@/lib/pins';
import { verificationConfig, verificationToken, sendVerificationEmail } from '@/lib/email-verification';
import { Prisma } from '@prisma/client';
import { emailVerificationRequired } from '@/lib/auth-config';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Enter your registration details.' }, { status: 400 });
    }
    const { email, pinCode, name, contactNumber } = body;

    // 1. Email Presence & Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Oops, this email doesn't look right." },
        { status: 400 }
      );
    }

    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email.trim().toLowerCase();

    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json({ error: 'Name must be text.' }, { status: 400 });
    }
    if (contactNumber !== undefined && typeof contactNumber !== 'string') {
      return NextResponse.json(
        { error: 'Contact number must be text.' },
        { status: 400 }
      );
    }

    // 2. PIN Code / Password Strength Validation
    if (typeof pinCode !== 'string' || !pinCode) {
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
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: emailVerificationRequired()
          ? 'An account with this email already exists. Sign in, or use Resend verification email with your existing PIN.'
          : 'An account with this email already exists. Sign in once your admin approves your account.' },
        { status: 400 }
      );
    }

    const requiresVerification = emailVerificationRequired();
    const origin = requiresVerification ? verificationConfig() : null;
    const token = requiresVerification ? verificationToken() : { verificationToken: null, tokenExpires: null };

    // 4. Create new staff account with Verification Tokens & Admin Approval Flag
    const user = await prisma.user.create({
      data: {
        name: name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        contactNumber: contactNumber?.trim() || null,
        pinCode: await hashPin(pinCode),
        isApproved: false,       // Requires admin approval before access is granted
        emailVerified: false,
        ...token,
      },
    });

    if (origin && token.verificationToken &&
        !await sendVerificationEmail(normalizedEmail, token.verificationToken, origin)) {
      return NextResponse.json(
        { error: 'Your account was saved, but the verification email could not be sent. Use Resend verification email with your email and PIN after one minute.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        message: requiresVerification
          ? 'Registration successful! Please check your email inbox to verify your address.'
          : 'Registration successful! Your account is awaiting admin approval. Contact your manager before signing in.',
        user: { id: user.id, email: user.email }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email or phone number already exists.' }, { status: 409 });
    }
    console.error('Registration failed:', error);
    return NextResponse.json(
      { error: 'Failed to create account.' },
      { status: 500 }
    );
  }
}