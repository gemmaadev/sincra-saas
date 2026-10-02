-- AlterEnum
BEGIN;
CREATE TYPE "ClientStage_new" AS ENUM ('LEAD', 'NEW', 'RECURRING', 'INACTIVE');
ALTER TABLE "Client" ALTER COLUMN "stage" TYPE "ClientStage_new" USING ("stage"::text::"ClientStage_new");
ALTER TYPE "ClientStage" RENAME TO "ClientStage_old";
ALTER TYPE "ClientStage_new" RENAME TO "ClientStage";
DROP TYPE "ClientStage_old";
COMMIT;
