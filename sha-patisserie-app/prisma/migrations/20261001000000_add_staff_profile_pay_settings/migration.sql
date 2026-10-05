CREATE TYPE "WorkingRightStatus" AS ENUM (
  'CITIZEN_OR_PERMANENT_RESIDENT',
  'STUDENT_VISA',
  'WORKING_HOLIDAY'
);

ALTER TABLE "User"
ADD COLUMN "hourlyPayRate" DECIMAL(10, 2),
ADD COLUMN "rateLastUpdated" DATE,
ADD COLUMN "workingRightStatus" "WorkingRightStatus",
ADD COLUMN "claimTaxFreeThreshold" BOOLEAN;