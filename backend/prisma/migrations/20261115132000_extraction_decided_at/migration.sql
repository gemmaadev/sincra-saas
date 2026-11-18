-- AlterTable
ALTER TABLE "extractions" ADD COLUMN     "decided_at" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "extractions_status_decided_at_idx" ON "extractions"("status", "decided_at");
