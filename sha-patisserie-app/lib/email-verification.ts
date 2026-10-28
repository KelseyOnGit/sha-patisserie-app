import { randomBytes } from 'node:crypto';
import { sendEmail } from '@/lib/notify';

export const VERIFICATION_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const VERIFICATION_COOLDOWN_MS = 60 * 1000;

export function verificationConfig() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredUrl && process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_APP_URL must be configured for verification emails.');
  }
  const url = new URL(configuredUrl || 'http://localhost:3000');
  if (!['http:', 'https:'].includes(url.protocol) ||
      (process.env.NODE_ENV === 'production' && url.protocol !== 'https:')) {
    throw new Error('Verification emails require a valid app URL (HTTPS in production).');
  }
  if (!process.env.RESEND_API_KEY?.trim() ||
      !(process.env.FROM_EMAIL?.trim() || process.env.EMAIL_FROM?.trim())) {
    throw new Error('RESEND_API_KEY and FROM_EMAIL must be configured for verification emails.');
  }
  return url.origin;
}

export function verificationToken() {
  return {
    verificationToken: randomBytes(32).toString('hex'),
    tokenExpires: new Date(Date.now() + VERIFICATION_LIFETIME_MS),
  };
}

export async function sendVerificationEmail(email: string, token: string, origin: string) {
  const url = new URL('/api/auth/verify', origin);
  url.searchParams.set('token', token);
  const result = await sendEmail(
    email,
    'Verify your Sha staff account',
    `<h2>Welcome to the Sha staff portal</h2>
     <p>Verify your email address to submit your account for admin approval.</p>
     <p><a href="${url.href}">Verify email address</a></p>
     <p>This link expires in 24 hours. You can sign in only after email verification and admin approval.</p>
     <p>If you did not request this account, ignore this email.</p>`,
  );
  if (!result.sent) {
    console.error('Verification email delivery failed:', result.reason);
    return false;
  }
  return true;
}
