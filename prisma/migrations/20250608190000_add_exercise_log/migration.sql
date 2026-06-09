-- CreateTable
CREATE TABLE "ExerciseEntry" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "exerciseKey" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExerciseEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSet" (
    "id" TEXT NOT NULL,
    "exerciseEntryId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "reps" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseEntry_recordId_sortOrder_idx" ON "ExerciseEntry"("recordId", "sortOrder");

-- CreateIndex
CREATE INDEX "ExerciseEntry_exerciseKey_idx" ON "ExerciseEntry"("exerciseKey");

-- CreateIndex
CREATE INDEX "ExerciseSet_exerciseEntryId_setNumber_idx" ON "ExerciseSet"("exerciseEntryId", "setNumber");

-- AddForeignKey
ALTER TABLE "ExerciseEntry" ADD CONSTRAINT "ExerciseEntry_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSet" ADD CONSTRAINT "ExerciseSet_exerciseEntryId_fkey" FOREIGN KEY ("exerciseEntryId") REFERENCES "ExerciseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
