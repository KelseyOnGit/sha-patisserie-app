import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { staffListSelect } from '@/lib/user-select';

class AccountError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function updateAccount(request: Request, approve: boolean) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isPrivilegedRole(session.role) || (!approve && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Only Admins can change account roles.' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.userId !== 'string' || !body.userId.trim() ||
        (body.role !== 'STAFF' && body.role !== 'ADMIN')) {
      throw new AccountError('Choose a user and a Staff or Admin role.', 400);
    }
    const { userId, role } = body;
    if (role === 'ADMIN' && session.role !== 'ADMIN') {
      throw new AccountError('Only Admins can assign the Admin role.', 403);
    }
    if (!approve && userId === session.userId) {
      throw new AccountError('You cannot change your own role. Ask another Admin.', 409);
    }
    const updatedUser = await prisma.$transaction(async (tx) => {
      const actor = await tx.user.findUnique({
        where: { id: session.userId },
        select: { role: true, isApproved: true, status: true },
      });
      if (!actor?.isApproved || actor.status !== 'ACTIVE' ||
          !isPrivilegedRole(actor.role) || ((!approve || role === 'ADMIN') && actor.role !== 'ADMIN')) {
        throw new AccountError('Your permissions changed. Refresh before retrying.', 403);
      }
      const target = await tx.user.findUnique({
        where: { id: userId },
        select: { role: true, isApproved: true, status: true },
      });
      if (!target) throw new AccountError('User not found.', 404);
      if (approve && target.isApproved) throw new AccountError('This account is already approved. Refresh the list.', 409);
      if (!approve && !target.isApproved) throw new AccountError('Approve this account through Pending Users first.', 409);
      if (target.role === 'ADMIN' && actor.role !== 'ADMIN') {
        throw new AccountError('Only Admins can manage Admin accounts.', 403);
      }
      if (target.role === 'ADMIN' && role !== 'ADMIN' && target.isApproved && target.status === 'ACTIVE') {
        const activeAdmins = await tx.user.count({ where: { role: 'ADMIN', isApproved: true, status: 'ACTIVE' } });
        if (activeAdmins <= 1) throw new AccountError('At least one active Admin must remain.', 409);
      }
      return tx.user.update({
        where: { id: userId },
        data: approve ? { role, isApproved: true, status: 'ACTIVE' } : { role },
        select: staffListSelect,
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({
      message: approve ? `User approved as ${role === 'ADMIN' ? 'Admin' : 'Staff'}.` : `Account moved to ${role === 'ADMIN' ? 'Admin' : 'Staff'}.`,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof AccountError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json({ error: 'Accounts changed. Refresh and retry.' }, { status: 409 });
    }
    console.error('Failed to update account:', error);
    return NextResponse.json({ error: 'Failed to update account.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) { return updateAccount(request, true); }
export async function PUT(request: Request) { return updateAccount(request, false); }

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Only Admins and Managers can remove pending sign-ups.' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.userId !== 'string' || !body.userId.trim()) {
      throw new AccountError('Choose a pending user to remove.', 400);
    }
    const userId = body.userId.trim();
    if (userId === session.userId) throw new AccountError('You cannot remove your own account.', 409);

    await prisma.$transaction(async (tx) => {
      const actor = await tx.user.findUnique({
        where: { id: session.userId },
        select: { role: true, isApproved: true, status: true },
      });
      if (!actor?.isApproved || actor.status !== 'ACTIVE' || !isPrivilegedRole(actor.role)) {
        throw new AccountError('Your permissions changed. Refresh before retrying.', 403);
      }
      const target = await tx.user.findUnique({
        where: { id: userId },
        select: {
          role: true, isApproved: true, status: true,
          _count: { select: {
            shifts: true, timeLogs: true, rosterShifts: true, timeEntries: true,
            leaveRequests: true, leaveReviews: true, timesheets: true, timesheetActions: true,
          } },
        },
      });
      if (!target) throw new AccountError('User not found. Refresh the list.', 404);
      if (target.isApproved || target.status !== 'PENDING') {
        throw new AccountError('Only unapproved pending sign-ups can be removed. Use End Profile for existing staff.', 409);
      }
      if (target.role === 'ADMIN' && actor.role !== 'ADMIN') {
        throw new AccountError('Only Admins can manage Admin accounts.', 403);
      }
      if (Object.values(target._count).some((count) => count > 0)) {
        throw new AccountError('This account has staff history and cannot be deleted. Use End Profile to retain its records.', 409);
      }
      const result = await tx.user.deleteMany({ where: { id: userId, isApproved: false, status: 'PENDING' } });
      if (result.count !== 1) throw new AccountError('Account changed. Refresh and retry.', 409);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ message: 'Pending sign-up removed.' });
  } catch (error) {
    if (error instanceof AccountError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2034', 'P2003'].includes(error.code)) {
      return NextResponse.json({ error: 'Account changed or has staff history. Refresh before retrying.' }, { status: 409 });
    }
    console.error('Failed to remove pending user:', error);
    return NextResponse.json({ error: 'Failed to remove pending sign-up.' }, { status: 500 });
  }
}
