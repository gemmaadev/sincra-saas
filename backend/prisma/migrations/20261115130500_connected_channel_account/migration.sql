-- AlterTable
ALTER TABLE "ConnectedChannel" ADD COLUMN     "account_email" TEXT,
ADD COLUMN     "provider_account_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedChannel_businessId_channel_account_email_key" ON "ConnectedChannel"("businessId", "channel", "account_email");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedChannel_businessId_channel_provider_account_id_key" ON "ConnectedChannel"("businessId", "channel", "provider_account_id");
