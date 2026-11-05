CREATE TABLE "AttendanceNotification" (
    "id" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "claimToken" TEXT,
    "claimUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttendanceNotification_pkey" PRIMARY KEY ("id")
);
