CREATE TYPE "WorkingHoursPolicy" AS ENUM ('POLICY', 'CUSTOM');

ALTER TABLE "User"
ADD COLUMN "workingHoursPolicy" "WorkingHoursPolicy" NOT NULL DEFAULT 'CUSTOM',
ADD COLUMN "regularWorkingHours" JSONB;