import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';

const profileSelect = {
  id: true,
  name: true,
  email: true,
  contactNumber: true,
  status: true,
  defaultBreakMinutes: true,
  hourlyPayRate: true,
  rateLastUpdated: true,
  workingRightStatus: true,
  claimTaxFreeThreshold: true,
  location: { select: { code: true, name: true } },
} as const;

const workingRightStatusByLabel = {
  'Aus Citizen / Permanent Resident': 'CITIZEN_OR_PERMANENT_RESIDENT',
  'Student Visa': 'STUDENT_VISA',
  'Working Holiday': 'WORKING_HOLIDAY',
} as const;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestedUserId = new URL(request.url).searchParams.get('userId');
  const userId = requestedUserId || session.userId;
  if (userId !== session.userId && !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    });
    if (!user) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        hourlyPayRate: user.hourlyPayRate?.toString() ?? '',
        rateLastUpdated: user.rateLastUpdated?.toISOString().slice(0, 10) ?? '',
        workingRightStatus: user.workingRightStatus
          ? Object.entries(workingRightStatusByLabel).find(([, value]) => value === user.workingRightStatus)?.[0] ?? ''
          : '',
      },
    });
  } catch (error) {
    console.error('Failed to fetch staff profile:', error);
    return NextResponse.json({ error: 'Failed to fetch staff profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId : session.userId;
    if (userId !== session.userId && !isPrivilegedRole(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      fullName,
      email,
      contactNumber,
      accountStatus,
      location,
      defaultBreak,
      hourlyPayRate,
      rateLastUpdated,
      workingRightStatus,
      claimTaxFreeThreshold,
    } = body;
    const payRateIsValid = hourlyPayRate === '' || (
      typeof hourlyPayRate === 'string' &&
      Number.isFinite(Number(hourlyPayRate)) &&
      Number(hourlyPayRate) >= 0
    );
    const dateIsValid = rateLastUpdated === '' || (
      typeof rateLastUpdated === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(rateLastUpdated) &&
      !Number.isNaN(Date.parse(`${rateLastUpdated}T00:00:00.000Z`))
    );
    if (
      typeof fullName !== 'string' ||
      !fullName.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      !['Active', 'Pending', 'Inactive (Left Company)'].includes(accountStatus) ||
      !['Sha Patisserie', 'Zushi Bento'].includes(location) ||
      !['30 mins', 'None'].includes(defaultBreak) ||
      (contactNumber !== undefined && typeof contactNumber !== 'string') ||
      !payRateIsValid ||
      !dateIsValid ||
      (workingRightStatus !== '' && !(workingRightStatus in workingRightStatusByLabel)) ||
      (claimTaxFreeThreshold !== null && typeof claimTaxFreeThreshold !== 'boolean')
    ) {
      return NextResponse.json({ error: 'Invalid staff profile details' }, { status: 400 });
    }

    const locationCode = location === 'Zushi Bento' ? 'ZB' : 'SHA';
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: fullName.trim(),
        email: email.trim(),
        contactNumber: contactNumber?.trim() || null,
        status: accountStatus === 'Active'
          ? 'ACTIVE'
          : accountStatus === 'Pending'
            ? 'PENDING'
            : 'INACTIVE',
        defaultBreakMinutes: defaultBreak === 'None' ? 0 : 30,
        hourlyPayRate: hourlyPayRate === '' ? null : new Prisma.Decimal(hourlyPayRate),
        rateLastUpdated: rateLastUpdated === ''
          ? null
          : new Date(`${rateLastUpdated}T00:00:00.000Z`),
        workingRightStatus: workingRightStatus === ''
          ? null
          : workingRightStatusByLabel[workingRightStatus as keyof typeof workingRightStatusByLabel],
        claimTaxFreeThreshold,
        location: {
          connectOrCreate: {
            where: { code: locationCode },
            create: {
              code: locationCode,
              name: location,
            },
          },
        },
      },
      select: profileSelect,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Failed to update staff profile:', error);
    return NextResponse.json({ error: 'Failed to update staff profile' }, { status: 500 });
  }
}