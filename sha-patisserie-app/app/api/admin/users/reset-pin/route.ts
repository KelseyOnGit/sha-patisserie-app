import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { hashPin } from '@/lib/pins';  

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { userId, newPin } = await req.json();

    if (!userId || !newPin) {
      return NextResponse.json({ error: 'User ID and new PIN are required' }, { status: 400 });
    }

    if (newPin.length < 4) {
      return NextResponse.json({ error: 'PIN must be at least 4 digits' }, { status: 400 });
    }

    // Hash the new PIN using your app's hashing utility
    const hashedPin = await hashPin(newPin);

    await prisma.user.update({
      where: { id: userId },
      data: { pinCode: hashedPin },
    });

    return NextResponse.json({ message: 'PIN reset successfully.' });
  } catch (error) {
    console.error('Reset PIN Error:', error);
    return NextResponse.json({ error: 'Failed to reset PIN' }, { status: 500 });
  }
}