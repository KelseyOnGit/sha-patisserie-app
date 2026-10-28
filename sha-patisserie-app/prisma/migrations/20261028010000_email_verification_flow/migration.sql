-- IF NOT EXISTS accommodates installations that already added these schema fields.
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "verificationToken" TEXT,
  ADD COLUMN IF NOT EXISTS "tokenExpires" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "User_verificationToken_key" ON "User"("verificationToken");

-- Grandfather approved accounts once; new/pending registrations must verify.
UPDATE "User"
SET "emailVerified" = true, "verificationToken" = NULL, "tokenExpires" = NULL
WHERE "isApproved" = true;
