DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    JOIN pg_namespace ON pg_type.typnamespace = pg_namespace.oid
    WHERE pg_namespace.nspname = 'public'
      AND pg_type.typname = 'LeaveStatus'
      AND pg_enum.enumlabel = 'CANCLE_REQUESTED'
  ) THEN
    ALTER TYPE "public"."LeaveStatus" RENAME VALUE 'CANCLE_REQUESTED' TO 'CANCEL_REQUESTED';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    JOIN pg_namespace ON pg_type.typnamespace = pg_namespace.oid
    WHERE pg_namespace.nspname = 'public'
      AND pg_type.typname = 'LeaveStatus'
      AND pg_enum.enumlabel = 'CANCEL_REQUESTED'
  ) THEN
    RAISE EXCEPTION 'LeaveStatus must contain CANCEL_REQUESTED after correction';
  END IF;
END $$;
