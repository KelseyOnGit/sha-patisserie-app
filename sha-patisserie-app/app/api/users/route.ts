import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { hashPin } from '@/lib/pins';
import { staffListSelect } from '@/lib/user-select';

// GET /api/users - Fetch all staff members
export async function GET() {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: session ? 403 : 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ['STAFF', 'MANAGER'] } },
      orderBy: { createdAt: 'desc' },
      select: staffListSelect,
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
      select: staffListSelect,
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
    if (typeof pinCode !== 'string' || !/^\d{4,6}$/.test(pinCode)) {
      return NextResponse.json({ error: 'PIN must contain 4 to 6 digits.' }, { status: 400 });
    }
    if (role !== undefined && !['STAFF', 'MANAGER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Choose a valid account role.' }, { status: 400 });
    }
    if (role === 'ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only Admins can assign the Admin role.' }, { status: 403 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role || 'STAFF',
        pinCode: await hashPin(pinCode),
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
      select: staffListSelect,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch {
    console.error('Failed to create user.');
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
  