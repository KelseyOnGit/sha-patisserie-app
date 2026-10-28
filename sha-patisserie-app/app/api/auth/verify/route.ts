import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const resultUrl = new URL('/verify-email', request.url);
  try {
    const token = new URL(request.url).searchParams.get('token');
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      resultUrl.searchParams.set('status', 'invalid');
      return NextResponse.redirect(resultUrl);
    }
    const result = await prisma.user.updateMany({
      where: {
        verificationToken: token,
        tokenExpires: { gt: new Date() },
        emailVerified: false,
      },
      data: { emailVerified: true, verificationToken: null, tokenExpires: null },
    });
    resultUrl.searchParams.set('status', result.count === 1 ? 'success' : 'invalid');
    return NextResponse.redirect(resultUrl);
  } catch (error) {
    console.error('Email verification failed:', error);
    resultUrl.searchParams.set('status', 'error');
    return NextResponse.redirect(resultUrl);
  }
}
