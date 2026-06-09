-- CreateTable
CREATE TABLE "DietItem" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "matchedName" TEXT NOT NULL DEFAULT '',
    "servingLabel" TEXT NOT NULL,
    "caloriesPerServing" INTEGER NOT NULL,
    "servings" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "totalCalories" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DietItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DietItem_recordId_sortOrder_idx" ON "DietItem"("recordId", "sortOrder");

-- AddForeignKey
ALTER TABLE "DietItem" ADD CONSTRAINT "DietItem_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE CASCADE ON UPDATE CASCADE;
