/*
  Warnings:

  - You are about to drop the column `winnerId` on the `Award` table. All the data in the column will be lost.
  - You are about to drop the `_AwardToEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Award" DROP CONSTRAINT "Award_winnerId_fkey";

-- DropForeignKey
ALTER TABLE "_AwardToEvent" DROP CONSTRAINT "_AwardToEvent_A_fkey";

-- DropForeignKey
ALTER TABLE "_AwardToEvent" DROP CONSTRAINT "_AwardToEvent_B_fkey";

-- AlterTable
ALTER TABLE "Award" DROP COLUMN "winnerId";

-- DropTable
DROP TABLE "_AwardToEvent";

-- CreateTable
CREATE TABLE "AwardInEvent" (
    "id" SERIAL NOT NULL,
    "awardId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "winnerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AwardInEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AwardInEvent" ADD CONSTRAINT "AwardInEvent_awardId_fkey" FOREIGN KEY ("awardId") REFERENCES "Award"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwardInEvent" ADD CONSTRAINT "AwardInEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwardInEvent" ADD CONSTRAINT "AwardInEvent_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
