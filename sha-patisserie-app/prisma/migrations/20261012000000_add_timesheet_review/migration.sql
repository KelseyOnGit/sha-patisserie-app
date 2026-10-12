-- Additive only: never replace attendance timestamps or backfill roster hours as worked hours.
BEGIN;
CREATE TYPE "TimesheetStatus" AS ENUM ('PENDING', 'APPROVED');

CREATE TABLE "Timesheet" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "shiftId" TEXT,
    "userId" TEXT NOT NULL,
    "workDate" DATE NOT NULL,
    "site" TEXT NOT NULL,
    "payablePeriods" JSONB NOT NULL,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL DEFAULT '',
    "status" "TimesheetStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rateAtApproval" DECIMAL(10,2),
    "sourceSnapshot" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Timesheet_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Timesheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Timesheet_sourceKey_key" ON "Timesheet"("sourceKey");
CREATE UNIQUE INDEX "Timesheet_shiftId_key" ON "Timesheet"("shiftId");
CREATE INDEX "Timesheet_workDate_status_idx" ON "Timesheet"("workDate", "status");

CREATE TABLE "TimesheetAudit" (
    "id" TEXT NOT NULL,
    "timesheetId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimesheetAudit_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TimesheetAudit_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TimesheetAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "TimesheetAudit_timesheetId_createdAt_idx" ON "TimesheetAudit"("timesheetId", "createdAt");

ALTER TABLE "TimeLog" ADD COLUMN "timesheetId" TEXT;
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_timesheetId_fkey"
    FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "TimeLog_userId_clockIn_idx" ON "TimeLog"("userId", "clockIn");
COMMIT;
