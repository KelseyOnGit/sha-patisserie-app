import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// @ts-expect-error geo.ts is a legacy script that exposes this utility at runtime.
import { isWithinOnsiteRange } from '@/lib/geo';

// GET active log for a specific user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const activeLog = await prisma.timeLog.findFirst({
      where: { userId, clockOut: null },
      orderBy: { clockIn: 'desc' },
    });
    return NextResponse.json({ activeLog });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}

// POST to Clock-In or Clock-Out
export async function POST(request: Request) {
  try {
    const { userId, action, location, userLat, userLng } = await request.json();

    if (!userId || userLat === undefined || userLng === undefined) {
      return NextResponse.json(
        { error: 'User ID and live GPS coordinates are required.' },
        { status: 400 }
      );
    }

    const targetLocation = (location as 'Sha' | 'ZB') || 'Sha';
    
    // Perform GPS Range Check against venue coordinates in lib/geo.ts
    const geoCheck = isWithinOnsiteRange(userLat, userLng, targetLocation);

    if (!geoCheck.allowed) {
      return NextResponse.json(
        {
          error: `Location verification failed. You must be onsite at ${targetLocation} to ${action}. You are currently ${geoCheck.distanceMeters}m away (max range: ${geoCheck.radiusMeters}m).`,
        },
        { status: 403 }
      );
    }

    if (action === 'clock-in') {
      const existing = await prisma.timeLog.findFirst({
        where: { userId, clockOut: null },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'You are already clocked in!' },
          { status: 400 }
        );
      }

      const newLog = await prisma.timeLog.create({
        data: {
          userId,
          location: targetLocation,
          lat: userLat,
          lng: userLng,
          clockIn: new Date(),
        },
      });

      return NextResponse.json({ message: 'Clocked in successfully!', log: newLog }, { status: 201 });
    }

    if (action === 'clock-out') {
      const activeLog = await prisma.timeLog.findFirst({
        where: { userId, clockOut: null },
      });

      if (!activeLog) {
        return NextResponse.json(
          { error: 'No active shift found to clock out from.' },
          { status: 400 }
        );
      }

      const updatedLog = await prisma.timeLog.update({
        where: { id: activeLog.id },
        data: { clockOut: new Date() },
      });

      return NextResponse.json({ message: 'Clocked out successfully!', log: updatedLog });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error processing clock request' }, { status: 500 });
  }
}