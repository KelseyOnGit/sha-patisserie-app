import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust path to your Prisma client instance

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'startDate and endDate parameters are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    // 1. Fetch active staff with their regular working hours
    const staff = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        workingHoursPolicy: true,
        regularWorkingHours: true,
      },
      orderBy: { name: 'asc' },
    });

    // 2. Fetch existing scheduled shifts within the date range
    const shifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return NextResponse.json({ staff, shifts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching roster data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roster data' },
      { status: 500 }
    );
  }
}

//Implement POST endpoint to create or update a shift
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, userId, date, startTime, endTime, role, status } = body;

    if (!userId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'userId, date, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    // Upsert: Update if shift ID exists, otherwise create a new shift record
    const shift = await prisma.shift.upsert({
      where: { id: id || '' },
      update: {
        startTime,
        endTime,
        role,
        status: status || 'DRAFT',
      },
      create: {
        userId,
        date: new Date(date),
        startTime,
        endTime,
        role,
        status: status || 'DRAFT',
      },
    });

    return NextResponse.json({ message: 'Shift saved successfully', shift }, { status: 200 });
  } catch (error) {
    console.error('Error saving shift:', error);
    return NextResponse.json(
      { error: 'Failed to save shift' },
      { status: 500 }
    );
  }
}

//Implement DELETE endpoint to remove a shift
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shiftId = searchParams.get('id');

    if (!shiftId) {
      return NextResponse.json(
        { error: 'Shift ID is required' },
        { status: 400 }
      );
    }

    await prisma.shift.delete({
      where: { id: shiftId },
    });

    return NextResponse.json({ message: 'Shift deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json(
      { error: 'Failed to delete shift' },
      { status: 500 }
    );
  }
}