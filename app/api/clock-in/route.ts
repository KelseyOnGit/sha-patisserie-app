import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type LocationName = 'Sha' | 'ZB';

const onsiteLocations: Record<LocationName, { lat: number; lng: number }> = {
  Sha: {
    lat: Number(process.env.SHA_LOCATION_LAT),
    lng: Number(process.env.SHA_LOCATION_LNG),
  },
  ZB: {
    lat: Number(process.env.ZB_LOCATION_LAT),
    lng: Number(process.env.ZB_LOCATION_LNG),
  },
};

const ONSITE_RANGE_METERS = Number(process.env.ONSITE_RANGE_METERS) || 100;

function isWithinOnsiteRange(lat: number, lng: number, location: LocationName) {
  const onsiteLocation = onsiteLocations[location];

  if (!Number.isFinite(onsiteLocation.lat) || !Number.isFinite(onsiteLocation.lng)) {
    return { allowed: false, distanceMeters: 0 };
  }

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMeters = 6_371_000;
  const latitudeDelta = toRadians(onsiteLocation.lat - lat);
  const longitudeDelta = toRadians(onsiteLocation.lng - lng);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(lat)) *
      Math.cos(toRadians(onsiteLocation.lat)) *
      Math.sin(longitudeDelta / 2) ** 2;
  const distanceMeters = Math.round(earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

  return { allowed: distanceMeters <= ONSITE_RANGE_METERS, distanceMeters };
}

// GET active status for a user
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

    const targetLocation = (location as LocationName) || 'Sha';
    const geoCheck = isWithinOnsiteRange(userLat, userLng, targetLocation);

    // Block clock-in/out if not onsite
    if (!geoCheck.allowed) {
      return NextResponse.json(
        {
          error: `Location verification failed. You must be onsite at ${targetLocation} to ${action}. You are currently ${geoCheck.distanceMeters}m away.`,
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