export interface MatchShift {
  id: string;
  userId: string;
  locationId: string | null;
  startTime: Date;
  endTime: Date;
}

export interface MatchLog {
  userId: string;
  locationId: string | null;
  clockIn: Date;
  clockOut: Date | null;
}

export function candidateShifts(log: MatchLog, shifts: MatchShift[], now: Date): MatchShift[] {
  // Match by employee and time, not the venue selected when clocking in.
  // No "closest shift" fallback: unrelated or ambiguous work stays visible for
  // review instead of silently getting attached to the wrong payroll record.
  return shifts.filter((shift) => shift.userId === log.userId &&
    log.clockIn < shift.endTime && (log.clockOut ?? now) > shift.startTime);
}
