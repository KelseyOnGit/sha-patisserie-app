import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = process.env.JWT_SECRET;
if (!secret?.trim()) throw new Error('JWT_SECRET must be configured before starting the app.');
const SECRET_KEY = new TextEncoder().encode(secret);

// Payload type for staff sessions
export type SessionPayload = {
  userId: string;
  email: string;
  role?: string;
};

// 1. Generate token and set HTTP-only cookie
export async function createSession(payload: SessionPayload) {
  // Create signed JWT expiring in 8 hours (typical shift duration)
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET_KEY);

  // Attach cookie to response
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true, // Prevents JavaScript from reading the cookie
    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
    sameSite: 'lax', // Protects against CSRF
    path: '/', // Cookie valid across entire site
    maxAge: 60 * 60 * 8, // 8 hours in seconds
  });
}

// 2. Verify and decrypt session token from incoming cookies
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionPayload;
  } catch {
    // Invalid or expired token
    return null;
  }
}

// 3. Clear session cookie (Logout)
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// True for roles allowed into the admin area (roster posting, staff approval)
export function isPrivilegedRole(role?: string): boolean {
  return role === 'ADMIN' || role === 'MANAGER';
}
