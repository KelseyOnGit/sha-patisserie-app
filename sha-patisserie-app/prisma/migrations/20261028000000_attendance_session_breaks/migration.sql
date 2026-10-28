ALTER TABLE "TimeLog"
ADD COLUMN "startBreak" TIMESTAMP(3),
ADD COLUMN "endBreak" TIMESTAMP(3);

ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_break_order_check"
CHECK (
  ("startBreak" IS NULL AND "endBreak" IS NULL)
  OR ("startBreak" IS NOT NULL AND "startBreak" >= "clockIn"
      AND ("endBreak" IS NULL OR "endBreak" >= "startBreak"))
);
