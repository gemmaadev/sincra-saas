-- AlterTable
ALTER TABLE "ConnectedChannel" ADD COLUMN     "account_email" TEXT,
ADD COLUMN     "provider_account_id" TEXT;

-- CreateIndex
CREATE INDEX "ConnectedChannel_channel_provider_account_id_idx" ON "ConnectedChannel"("channel", "provider_account_id");

-- CreateIndex
CREATE INDEX "ConnectedChannel_channel_account_email_idx" ON "ConnectedChannel"("channel", "account_email");
