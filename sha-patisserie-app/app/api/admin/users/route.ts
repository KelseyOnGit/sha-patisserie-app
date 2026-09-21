import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
//The API Endpoint
export async function PATCH(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });

    return NextResponse.json({ message: 'User approved successfully.', user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to approve user.' }, { status: 500 });
  }
}