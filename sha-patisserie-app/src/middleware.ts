import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-this'
);

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value;
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  // If user tries to access /dashboard without a session, redirect to /login
  if (isDashboardRoute) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    
    try {
      await jwtVerify(sessionToken, SECRET_KEY);
      return NextResponse.next();
    } catch (error) {
      // Token expired or invalid -> redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Specify which paths trigger this middleware
export const config = {
  matcher: ['/dashboard/:path*'],
};