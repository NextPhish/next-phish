-- Required by the installed Better Auth 1.6 two-factor plugin.
ALTER TABLE "two_factor"
ADD COLUMN "failedVerificationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lockedUntil" TIMESTAMP(3);
