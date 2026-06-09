-- CreateEnum
CREATE TYPE "CardioType" AS ENUM ('RUNNING', 'CYCLING', 'WALKING', 'SWIMMING', 'HIIT', 'ROWING', 'ELLIPTICAL', 'JUMP_ROPE', 'OTHER');

-- AlterTable
ALTER TABLE "Record"
ADD COLUMN "cardioType" "CardioType",
ADD COLUMN "cardioDurationMin" INTEGER,
ADD COLUMN "cardioDistanceKm" DOUBLE PRECISION,
ADD COLUMN "cardioCalories" INTEGER,
ADD COLUMN "cardioHeartRateBpm" INTEGER;
