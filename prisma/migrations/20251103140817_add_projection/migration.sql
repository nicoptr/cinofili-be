-- AlterTable
ALTER TABLE "Award" ADD COLUMN     "winnerId" INTEGER;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "isProjectionPlanned" BOOLEAN DEFAULT false,
ADD COLUMN     "isReadyForProjection" BOOLEAN DEFAULT false,
ADD COLUMN     "isReadyForRating" BOOLEAN DEFAULT false,
ADD COLUMN     "projectAt" TIMESTAMP(3),
ADD COLUMN     "projectionOrder" INTEGER;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
