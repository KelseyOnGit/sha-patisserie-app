ALTER TABLE "Shift" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- Shifts that already exist were visible to staff, so keep them published.
UPDATE "Shift" SET "publishedAt" = "createdAt";
