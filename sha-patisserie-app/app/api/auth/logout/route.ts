import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function POST(request: Request) {
  // 1. Delete the session cookie
  await deleteSession();

  // 2. Redirect back to the login page
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
}