import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';

// GET /api/users - Fetch all staff members
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { location: { select: { code: true, name: true } } },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { userId, location } = await request.json();
    if (!userId || (location !== 'SHA' && location !== 'ZB')) {
      return NextResponse.json({ error: 'A user and valid venue are required' }, { status: 400 });
    }

    const locationName = location === 'ZB' ? 'Zushi Bento' : 'Sha Patisserie';
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        location: {
          connectOrCreate: {
            where: { code: location },
            create: { code: location, name: locationName },
          },
        },
      },
      include: { location: { select: { code: true, name: true } } },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update staff venue:', error);
    return NextResponse.json({ error: 'Failed to update staff venue' }, { status: 500 });
  }
}

// POST /api/users - Create a new staff member
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, role, pinCode, location } = body;

    if (!name || !email || !pinCode) {
      return NextResponse.json({ error: 'Name, email, and PIN are required' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role || 'STAFF',
        pinCode,
        location: {
          connectOrCreate: {
            where: { code: location === 'ZB' ? 'ZB' : 'SHA' },
            create: {
              code: location === 'ZB' ? 'ZB' : 'SHA',
              name: location === 'ZB' ? 'Zushi Bento' : 'Sha Patisserie',
            },
          },
        },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
  