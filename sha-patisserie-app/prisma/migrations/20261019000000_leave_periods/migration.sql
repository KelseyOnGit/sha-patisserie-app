ALTER TABLE "LeaveRequest" ADD COLUMN "requestGroupId" TEXT;
CREATE INDEX "LeaveRequest_requestGroupId_idx" ON "LeaveRequest"("requestGroupId");