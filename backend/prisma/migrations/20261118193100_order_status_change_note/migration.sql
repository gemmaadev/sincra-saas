-- AlterTable
ALTER TABLE "OrderStatusChange" ADD COLUMN "note" TEXT;
ALTER TABLE "OrderStatusChange" ADD COLUMN "source_extraction_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OrderStatusChange_source_extraction_id_key" ON "OrderStatusChange"("source_extraction_id");
