-- AlterEnum
BEGIN;
CREATE TYPE "Channel_new" AS ENUM ('GMAIL', 'OUTLOOK', 'WHATSAPP', 'INSTAGRAM', 'MESSENGER');
ALTER TABLE "Client" ALTER COLUMN "channels" TYPE "Channel_new"[] USING ("channels"::text[]::"Channel_new"[]);
ALTER TYPE "Channel" RENAME TO "Channel_old";
ALTER TYPE "Channel_new" RENAME TO "Channel";
DROP TYPE "Channel_old";
COMMIT;
