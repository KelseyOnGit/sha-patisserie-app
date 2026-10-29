import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPin } from '@/lib/pins';
import { emailVerificationRequired } from '@/lib/auth-config';
import {
  verificationConfig, verificationToken, sendVerificationEmail,
  VERIFICATION_LIFETIME_MS, VERIFICATION_COOLDOWN_MS,
} from '@/lib/email-verification';

export async function POST(request: Request) {
  if (!emailVerificationRequired()) {
    return NextResponse.json({ error: 'Email verification is temporarily disabled. Contact your manager for account approval.' }, { status: 503 });
  }
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.email !== 'string' ||
        typeof body.pinCode !== 'string' || !/^\d{4,6}$/.test(body.pinCode)) {
      return NextResponse.json({ error: 'Enter your registration email and PIN.' }, { status: 400 });
    }
    const user = await prisma.user.findFirst({
      where: { email: { equals: body.email.trim().toLowerCase(), mode: 'insensitive' } },
    });
    if (!user || !await verifyPin(body.pinCode, user.pinCode)) {
      return NextResponse.json({ error: 'Invalid email or PIN.' }, { status: 401 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ message: 'Your email is already verified. Sign in once your admin approves your account.' });
    }
    if (user.status === 'INACTIVE') {
      return NextResponse.json({ error: 'This account is inactive. Contact your manager.' }, { status: 403 });
    }
    const now = Date.now();
    // Expiry also records the issue time: all tokens have a fixed 24-hour lifetime.
    if (user.tokenExpires && user.tokenExpires.getTime() - VERIFICATION_LIFETIME_MS > now - VERIFICATION_COOLDOWN_MS) {
      return NextResponse.json({ error: 'Wait one minute before requesting another verification email.' }, {
        status: 429, headers: { 'Retry-After': '60' },
      });
    }
    const origin = verificationConfig();
    const token = verificationToken();
    const result = await prisma.user.updateMany({
      where: {
        id: user.id, emailVerified: false, status: { not: 'INACTIVE' },
        verificationToken: user.verificationToken, tokenExpires: user.tokenExpires,
      },
      data: token,
    });
    if (result.count !== 1) {
      return NextResponse.json({ error: 'Your account changed. Refresh and retry in one minute.' }, { status: 409 });
    }
    if (!await sendVerificationEmail(user.email, token.verificationToken, origin)) {
      return NextResponse.json({ error: 'The verification email could not be sent. Please retry after one minute.' }, { status: 502 });
    }
    return NextResponse.json({ message: 'Verification email sent. Check your inbox and spam folder. The newest link is valid for 24 hours.' });
  } catch (error) {
    console.error('Resending verification email failed:', error);
    return NextResponse.json({ error: 'Unable to resend verification email. Please try again later.' }, { status: 500 });
  }
}
