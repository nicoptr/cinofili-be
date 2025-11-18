-- DropForeignKey
ALTER TABLE "AwardInEvent" DROP CONSTRAINT "AwardInEvent_winnerId_fkey";

-- AlterTable
ALTER TABLE "AwardInEvent" ALTER COLUMN "winnerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AwardInEvent" ADD CONSTRAINT "AwardInEvent_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
