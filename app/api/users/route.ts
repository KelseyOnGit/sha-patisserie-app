import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users - Fetch all staff members
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create a new staff member
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, pinCode } = body;

    if (!name || !email || !pinCode) {
      return NextResponse.json({ error: 'Name, email, and PIN are required' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role || 'STAFF',
        pinCode,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}