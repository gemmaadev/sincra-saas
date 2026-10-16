-- CreateEnum
CREATE TYPE "ChannelConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'MOCKED');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'es',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Europe/Madrid';

-- CreateTable
CREATE TABLE "ConnectedChannel" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "status" "ChannelConnectionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "ConnectedChannel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConnectedChannel_businessId_idx" ON "ConnectedChannel"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedChannel_businessId_channel_key" ON "ConnectedChannel"("businessId", "channel");

-- AddForeignKey
ALTER TABLE "ConnectedChannel" ADD CONSTRAINT "ConnectedChannel_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
