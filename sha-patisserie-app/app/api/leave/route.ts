import { Prisma, type LeaveStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { randomUUID } from 'node:crypto';
import { annualNoticeError, leaveDate, leavePeriod, perthToday } from '@/lib/leave';

class LeaveError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

type Tx = Prisma.TransactionClient;
type LeaveType = 'ANNUAL' | 'PERSONAL' | 'UNPAID';
type Body = Record<string, unknown>;

const SERIALIZABLE = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable };
const OPEN: LeaveStatus[] = ['PENDING', 'APPROVED', 'CANCEL_REQUESTED'];
const staffSelect = { id: true, name: true, employmentType: true, annualLeaveHours: true, personalLeaveHours: true } as const;

function dateValue(value: unknown) {
  try { return leaveDate(value); }
  catch { throw new LeaveError('Choose valid leave dates.'); }
}

function failure(error: unknown) {
  if (error instanceof LeaveError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
    return NextResponse.json({ error: 'Leave data changed. Refresh and retry.' }, { status: 409 });
  }
  console.error('Leave request failed:', error);
  return NextResponse.json({ error: 'Unable to process leave.' }, { status: 500 });
}

async function readBody(request: Request): Promise<Body> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new LeaveError('Invalid leave request.');
  return body as Body;
}

/** Validates dates, type, hours per day and note. Shared by create, change and edit. */
function parseLeave(body: Body) {
  const hasPeriod = body.startDate !== undefined || body.endDate !== undefined;
  let dates: Date[];
  if (hasPeriod) {
    try { dates = leavePeriod(body.startDate, body.endDate); }
    catch (error) { throw new LeaveError(error instanceof Error ? error.message : 'Invalid leave period.'); }
  } else {
    if (!Array.isArray(body.dates) || !body.dates.length || body.dates.length > 31) throw new LeaveError('Select between 1 and 31 leave dates.');
    dates = (body.dates as unknown[]).map(dateValue);
  }
  if (new Set(dates.map((date) => date.getTime())).size !== dates.length) throw new LeaveError('Each leave date must be unique.');
  if (!['ANNUAL', 'PERSONAL', 'UNPAID'].includes(body.type as string)) throw new LeaveError('Choose annual, personal or unpaid leave.');
  const type = body.type as LeaveType;
  const hours = Number(body.hours);
  if (!Number.isFinite(hours) || hours <= 0 || hours > 24 || Math.abs(hours * 100 - Math.round(hours * 100)) > 0.000001) {
    throw new LeaveError('Enter hours per selected day between 0.01 and 24, with at most two decimal places.');
  }
  const note = typeof body.note === 'string' ? body.note.trim() : '';
  if (note.length > 2000) throw new LeaveError('Notes must be 2,000 characters or fewer.');
  return { dates, type, hours, note };
}

const balanceField = (type: LeaveType) => (type === 'ANNUAL' ? 'annualLeaveHours' : 'personalLeaveHours');
const sumHours = (entries: { hours: Prisma.Decimal }[]) => entries.reduce((sum, entry) => sum.plus(entry.hours), new Prisma.Decimal(0));

function assertEligible(employmentType: string | null, type: LeaveType) {
  if (type !== 'UNPAID' && !['FULL_TIME', 'PART_TIME'].includes(employmentType ?? '')) {
    throw new LeaveError('Paid leave requires Full Time or Part Time employment.');
  }
}

/** Puts hours back on the staff member's balance (paid leave only). */
async function refund(tx: Tx, userId: string, type: LeaveType, hours: Prisma.Decimal) {
  if (type === 'UNPAID' || hours.isZero()) return;
  await tx.user.update({ where: { id: userId }, data: { [balanceField(type)]: { increment: hours } } });
}

/** Takes hours off the balance, failing if there is not enough (paid leave only). */
/** Takes hours off the balance (paid leave only). Managers may push it below zero. */
async function deduct(tx: Tx, userId: string, type: LeaveType, hours: Prisma.Decimal) {
  if (type === 'UNPAID' || hours.isZero()) return;
  await tx.user.update({
    where: { id: userId },
    data: { [balanceField(type)]: { decrement: hours } },
  });
}

/** Loads a request and every other row in its group (a group is one leave period). */
async function loadGroup(tx: Tx, id: string) {
  const leave = await tx.leaveRequest.findUnique({ where: { id }, include: { user: { select: staffSelect } } });
  if (!leave) throw new LeaveError('Leave request not found.', 404);
  const entries = leave.requestGroupId
    ? await tx.leaveRequest.findMany({ where: { requestGroupId: leave.requestGroupId, userId: leave.userId } })
    : [leave];
  return { leave, entries };
}

/** Changes every row in a group, but only if they are all still in the expected status. */
async function setStatus(tx: Tx, entries: { id: string }[], from: LeaveStatus, data: Prisma.LeaveRequestUncheckedUpdateManyInput) {
  const updated = await tx.leaveRequest.updateMany({ where: { id: { in: entries.map((entry) => entry.id) }, status: from }, data });
  if (updated.count !== entries.length) throw new LeaveError('Leave changed. Refresh before retrying.', 409);
}

async function assertNoOverlap(tx: Tx, userId: string, dates: Date[], ignoreIds: string[]) {
  const clash = await tx.leaveRequest.findFirst({ where: { userId, workDate: { in: dates }, status: { in: OPEN }, id: { notIn: ignoreIds } } });
  if (clash) throw new LeaveError('A leave request already exists for one of these dates.', 409);
}

/** Withdraws change requests that were waiting on leave that is being replaced or cancelled. */
async function cancelPendingChanges(tx: Tx, entries: { id: string }[], reviewNote: string) {
  await tx.leaveRequest.updateMany({
    where: { replacesId: { in: entries.map((entry) => entry.id) }, status: 'PENDING' },
    data: { status: 'CANCELLED', reviewNote },
  });
}

/** Staff may only change or cancel approved leave that has not finished. */
function assertStaffCanChange(entries: { status: LeaveStatus; workDate: Date }[]) {
  if (entries.some((entry) => entry.status !== 'APPROVED')) throw new LeaveError('Only approved leave can be changed or cancelled.', 409);
  const last = Math.max(...entries.map((entry) => entry.workDate.getTime()));
  if (last < perthToday().getTime()) throw new LeaveError('Leave that has already finished cannot be changed. Ask a manager.', 409);
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const manage = new URL(request.url).searchParams.get('view') === 'review';
    if (manage && !isPrivilegedRole(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const [staff, requests] = await Promise.all([
      prisma.user.findMany({ where: manage ? {} : { id: session.userId }, select: staffSelect, orderBy: { name: 'asc' } }),
      prisma.leaveRequest.findMany({
        where: manage ? {} : { userId: session.userId },
        include: { user: { select: { name: true, employmentType: true } }, reviewer: { select: { name: true } } },
        orderBy: [{ status: 'asc' }, { workDate: 'desc' }],
      }),
    ]);
    return NextResponse.json({ manage, currentUserId: session.userId, staff, requests });
  } catch (error) { return failure(error); }
}

/**
 * POST creates leave. Three cases:
 *  - staff request (default): pending, annual leave needs 7 days' notice
 *  - { replacesId }: staff proposes new dates for approved leave; the original stays approved until reviewed
 *  - { userId } (manager only): leave created for someone else, approved immediately, no notice rule
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await readBody(request);
    const { dates, type, hours, note } = parseLeave(body);
    const targetId = typeof body.userId === 'string' && body.userId ? body.userId : session.userId;
    const onBehalf = targetId !== session.userId;
    if (onBehalf && !isPrivilegedRole(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const replacesId = !onBehalf && typeof body.replacesId === 'string' && body.replacesId ? body.replacesId : null;
    if (!onBehalf && type === 'ANNUAL') {
      const notice = annualNoticeError(dates);
      if (notice) throw new LeaveError(notice);
    }
    const groupId = randomUUID();
    const total = new Prisma.Decimal(hours).times(dates.length);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: targetId }, select: staffSelect });
      if (!user) throw new LeaveError('Staff member not found.', 404);
      assertEligible(user.employmentType, type);

      let ignoreIds: string[] = [];
      if (replacesId) {
        const { leave, entries } = await loadGroup(tx, replacesId);
        if (leave.userId !== session.userId) throw new LeaveError('Forbidden', 403);
        assertStaffCanChange(entries);
        ignoreIds = entries.map((entry) => entry.id);
        const waiting = await tx.leaveRequest.findFirst({ where: { replacesId: { in: ignoreIds }, status: 'PENDING' } });
        if (waiting) throw new LeaveError('A change to this leave is already waiting for approval.', 409);
      }
      await assertNoOverlap(tx, targetId, dates, ignoreIds);

      if (onBehalf) await deduct(tx, targetId, type, total);
      const approved = onBehalf ? { status: 'APPROVED' as const, reviewedBy: session.userId, reviewedAt: new Date() } : {};
      await tx.leaveRequest.createMany({
        data: dates.map((workDate) => ({ userId: targetId, workDate, type, hours, note, requestGroupId: groupId, replacesId, ...approved })),
      });
    }, SERIALIZABLE);

    const message = onBehalf
      ? 'Leave created and approved; balance updated.'
      : replacesId
        ? 'Change submitted. Your current leave stays approved until a manager reviews it.'
        : 'Leave request submitted. Awaiting approval.';
    return NextResponse.json({ message, days: dates.length }, { status: 201 });
  } catch (error) { return failure(error); }
}

/** Manager: approve or reject a pending request, a pending change, or a cancellation request. */
async function reviewLeave(tx: Tx, reviewerId: string, id: string, status: 'APPROVED' | 'REJECTED', reviewNote: string) {
  const { leave, entries } = await loadGroup(tx, id);
  if (leave.userId === reviewerId) throw new LeaveError('Another manager must review your own leave.', 403);
  const from = leave.status;
  if ((from !== 'PENDING' && from !== 'CANCEL_REQUESTED') || entries.some((entry) => entry.status !== from || entry.type !== leave.type)) {
    throw new LeaveError('This request has already been reviewed or changed. Refresh before retrying.', 409);
  }
  const reviewed = { reviewedBy: reviewerId, reviewedAt: new Date(), reviewNote };
  const total = sumHours(entries);

  if (from === 'CANCEL_REQUESTED') {
    if (status === 'APPROVED') {
      await refund(tx, leave.userId, leave.type, total);
      await setStatus(tx, entries, from, { status: 'CANCELLED', ...reviewed });
      return 'Cancellation approved; leave hours returned.';
    }
    await setStatus(tx, entries, from, { status: 'APPROVED', ...reviewed });
    return 'Cancellation declined; the leave stays approved.';
  }

  if (status === 'REJECTED') {
    await setStatus(tx, entries, from, { status: 'REJECTED', ...reviewed });
    return leave.replacesId ? 'Change rejected; the original leave stays approved.' : 'Leave rejected; no hours deducted.';
  }

  assertEligible(leave.user.employmentType, leave.type);
  if (leave.replacesId) {
    const original = await loadGroup(tx, leave.replacesId);
    if (original.entries.some((entry) => entry.status !== 'APPROVED')) {
      throw new LeaveError('The original leave has changed. Reject this change and ask the staff member to resubmit.', 409);
    }
    await refund(tx, original.leave.userId, original.leave.type, sumHours(original.entries));
    await setStatus(tx, original.entries, 'APPROVED', { status: 'CANCELLED' });
  }
  await deduct(tx, leave.userId, leave.type, total);
  await setStatus(tx, entries, from, { status: 'APPROVED', ...reviewed });
  return leave.replacesId ? 'Change approved; leave balance updated.' : 'Leave approved; applicable balance deducted.';
}

/** Manager: edit a pending or approved request at any time. Balance is adjusted straight away. */
async function editLeave(tx: Tx, managerId: string, id: string, body: Body, reviewNote: string) {
  const { leave, entries } = await loadGroup(tx, id);
  if (leave.userId === managerId) throw new LeaveError('Another manager must edit your own leave.', 403);
  const from = leave.status;
  if ((from !== 'PENDING' && from !== 'APPROVED') || entries.some((entry) => entry.status !== from)) {
    throw new LeaveError('Only pending or approved leave can be edited. Refresh before retrying.', 409);
  }
  const { dates, type, hours, note } = parseLeave(body);
  assertEligible(leave.user.employmentType, type);
  const ids = entries.map((entry) => entry.id);
  await assertNoOverlap(tx, leave.userId, dates, ids);

  if (from === 'PENDING') {
    // Nothing has been deducted yet, so the request is rewritten in place.
    const deleted = await tx.leaveRequest.deleteMany({ where: { id: { in: ids }, status: 'PENDING' } });
    if (deleted.count !== ids.length) throw new LeaveError('Leave changed. Refresh before retrying.', 409);
    const groupId = leave.requestGroupId ?? randomUUID();
    await tx.leaveRequest.createMany({
      data: dates.map((workDate) => ({
        userId: leave.userId, workDate, type, hours, note, requestGroupId: groupId, replacesId: leave.replacesId, createdAt: leave.createdAt,
      })),
    });
    return 'Pending request updated.';
  }

  await refund(tx, leave.userId, leave.type, sumHours(entries));
  await deduct(tx, leave.userId, type, new Prisma.Decimal(hours).times(dates.length));
  await setStatus(tx, entries, 'APPROVED', { status: 'CANCELLED' });
  await cancelPendingChanges(tx, entries, 'Replaced by a manager edit.');
  const groupId = randomUUID();
  await tx.leaveRequest.createMany({
    data: dates.map((workDate) => ({
      userId: leave.userId, workDate, type, hours, note, requestGroupId: groupId, replacesId: leave.id,
      status: 'APPROVED' as const, reviewedBy: managerId, reviewedAt: new Date(), reviewNote,
    })),
  });
  return 'Leave updated; balance adjusted.';
}

/** Manager: cancel approved leave straight away and return the hours. */
async function cancelLeave(tx: Tx, managerId: string, id: string, reviewNote: string) {
  const { leave, entries } = await loadGroup(tx, id);
  if (leave.userId === managerId) throw new LeaveError('Another manager must cancel your own leave.', 403);
  if (entries.some((entry) => entry.status !== 'APPROVED')) throw new LeaveError('Only approved leave can be cancelled. Refresh before retrying.', 409);
  await refund(tx, leave.userId, leave.type, sumHours(entries));
  await setStatus(tx, entries, 'APPROVED', { status: 'CANCELLED', reviewedBy: managerId, reviewedAt: new Date(), reviewNote });
  await cancelPendingChanges(tx, entries, 'The original leave was cancelled by a manager.');
  return 'Leave cancelled; hours returned.';
}

/** Staff: ask for approved leave to be cancelled. It stays approved until a manager agrees. */
async function requestCancel(tx: Tx, userId: string, id: string) {
  const { leave, entries } = await loadGroup(tx, id);
  if (leave.userId !== userId) throw new LeaveError('Forbidden', 403);
  assertStaffCanChange(entries);
  const waiting = await tx.leaveRequest.findFirst({ where: { replacesId: { in: entries.map((entry) => entry.id) }, status: 'PENDING' } });
  if (waiting) throw new LeaveError('Withdraw your pending change before asking to cancel.', 409);
  await setStatus(tx, entries, 'APPROVED', { status: 'CANCEL_REQUESTED' });
  return 'Cancellation requested. Your leave stays approved until a manager reviews it.';
}

/** Staff: withdraw a request (or a change) that has not been reviewed. Nothing was deducted. */
async function withdrawLeave(tx: Tx, userId: string, id: string) {
  const { leave, entries } = await loadGroup(tx, id);
  if (leave.userId !== userId) throw new LeaveError('Forbidden', 403);
  if (entries.some((entry) => entry.status !== 'PENDING')) throw new LeaveError('Only pending requests can be withdrawn. Refresh before retrying.', 409);
  await setStatus(tx, entries, 'PENDING', { status: 'CANCELLED' });
  return 'Request withdrawn.';
}

/**
 * PATCH takes { id, action }:
 *  manager: review (default, needs status), edit, cancel
 *  staff:   request-cancel, withdraw
 */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await readBody(request);
    if (typeof body.id !== 'string' || !body.id) throw new LeaveError('Choose a leave request.');
    const id = body.id;
    const action = typeof body.action === 'string' ? body.action : 'review';
    const staffActions = ['request-cancel', 'withdraw'];
    if (!staffActions.includes(action) && !isPrivilegedRole(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const reviewNote = typeof body.reviewNote === 'string' ? body.reviewNote.trim() : '';
    if (reviewNote.length > 2000) throw new LeaveError('Review note is too long.');

    const message = await prisma.$transaction(async (tx) => {
      switch (action) {
        case 'review':
          if (body.status !== 'APPROVED' && body.status !== 'REJECTED') throw new LeaveError('Choose a request and review action.');
          return reviewLeave(tx, session.userId, id, body.status, reviewNote);
        case 'edit': return editLeave(tx, session.userId, id, body, reviewNote);
        case 'cancel': return cancelLeave(tx, session.userId, id, reviewNote);
        case 'request-cancel': return requestCancel(tx, session.userId, id);
        case 'withdraw': return withdrawLeave(tx, session.userId, id);
        default: throw new LeaveError('Unknown leave action.');
      }
    }, SERIALIZABLE);
    return NextResponse.json({ message });
  } catch (error) { return failure(error); }
}