-- Leave: cancellation requests, cancelled leave, and change requests that point at the leave they replace.
ALTER TYPE "LeaveStatus" ADD VALUE 'CANCEL_REQUESTED';
ALTER TYPE "LeaveStatus" ADD VALUE 'CANCELLED';

ALTER TABLE "LeaveRequest" ADD COLUMN "replacesId" TEXT;
CREATE INDEX "LeaveRequest_replacesId_idx" ON "LeaveRequest"("replacesId");