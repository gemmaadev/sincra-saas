/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `businessId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_businessId_fkey";

-- DropIndex
DROP INDEX "User_businessId_idx";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "address" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "nif" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "schedule" TEXT,
ADD COLUMN     "stripeId" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl",
DROP COLUMN "businessId",
DROP COLUMN "role",
DROP COLUMN "status",
ADD COLUMN     "invitationCode" TEXT;

-- CreateTable
CREATE TABLE "BusinessMember" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "avatarUrl" TEXT,
    "phone" TEXT,
    "businessEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessMember_businessId_idx" ON "BusinessMember"("businessId");

-- CreateIndex
CREATE INDEX "BusinessMember_userId_idx" ON "BusinessMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMember_businessId_userId_key" ON "BusinessMember"("businessId", "userId");

-- AddForeignKey
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
