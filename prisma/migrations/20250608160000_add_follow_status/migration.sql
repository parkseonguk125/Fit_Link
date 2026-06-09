-- CreateEnum
CREATE TYPE "FollowStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- AlterTable
ALTER TABLE "Follow" ADD COLUMN "status" "FollowStatus" NOT NULL DEFAULT 'PENDING';

-- Existing mutual follows stay active
UPDATE "Follow" SET "status" = 'ACCEPTED';

-- CreateIndex
CREATE INDEX "Follow_followingId_status_idx" ON "Follow"("followingId", "status");
