-- CreateEnum
CREATE TYPE "ExtractionType" AS ENUM ('QUOTE_REQUEST', 'ORDER_CONFIRMED', 'POTENTIAL_ORDER', 'INQUIRY', 'ORDER_CHANGE', 'ORDER_CANCELLATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DISCARDED');

-- Known labels are uppercased in place. Unknown types become OTHER and unknown statuses become PENDING.
DO $$
DECLARE
    unknown_type_count integer;
    unknown_status_count integer;
BEGIN
    SELECT COUNT(*)
    INTO unknown_type_count
    FROM "extractions"
    WHERE UPPER("extraction_type") NOT IN (
        'QUOTE_REQUEST',
        'ORDER_CONFIRMED',
        'POTENTIAL_ORDER',
        'INQUIRY',
        'ORDER_CHANGE',
        'ORDER_CANCELLATION',
        'OTHER'
    );

    IF unknown_type_count > 0 THEN
        RAISE NOTICE 'Found % extractions.extraction_type value(s) outside ExtractionType; mapping them to OTHER', unknown_type_count;
    END IF;

    UPDATE "extractions"
    SET "extraction_type" = CASE
        WHEN UPPER("extraction_type") IN (
            'QUOTE_REQUEST',
            'ORDER_CONFIRMED',
            'POTENTIAL_ORDER',
            'INQUIRY',
            'ORDER_CHANGE',
            'ORDER_CANCELLATION',
            'OTHER'
        ) THEN UPPER("extraction_type")
        ELSE 'OTHER'
    END;

    SELECT COUNT(*)
    INTO unknown_status_count
    FROM "extractions"
    WHERE UPPER("status") NOT IN ('PENDING', 'CONFIRMED', 'DISCARDED');

    IF unknown_status_count > 0 THEN
        RAISE NOTICE 'Found % extractions.status value(s) outside ExtractionStatus; mapping them to PENDING', unknown_status_count;
    END IF;

    UPDATE "extractions"
    SET "status" = CASE
        WHEN UPPER("status") IN ('PENDING', 'CONFIRMED', 'DISCARDED') THEN UPPER("status")
        ELSE 'PENDING'
    END;
END $$;

-- AlterTable
ALTER TABLE "extractions" ALTER COLUMN "extraction_type" TYPE "ExtractionType" USING ("extraction_type"::"ExtractionType");

-- The text default 'pending' cannot be cast to ExtractionStatus. Drop it, change the type, then set the enum default.
ALTER TABLE "extractions" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "ExtractionStatus" USING ("status"::"ExtractionStatus"),
ALTER COLUMN "status" SET DEFAULT 'PENDING';
