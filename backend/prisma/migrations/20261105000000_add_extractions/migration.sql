-- CreateTable
CREATE TABLE "extractions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" TEXT NOT NULL,
    "email_id" TEXT NOT NULL,
    "email_subject" TEXT,
    "email_from" TEXT NOT NULL,
    "email_to" TEXT,
    "extraction_type" TEXT NOT NULL,
    "raw_data" JSONB NOT NULL DEFAULT '{}',
    "confidence" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "synced_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extractions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "extractions_business_id_status_idx" ON "extractions"("business_id", "status");

-- CreateIndex
CREATE INDEX "extractions_email_id_idx" ON "extractions"("email_id");

-- CreateIndex
CREATE INDEX "extractions_extraction_type_idx" ON "extractions"("extraction_type");

-- AddForeignKey
ALTER TABLE "extractions" ADD CONSTRAINT "extractions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

