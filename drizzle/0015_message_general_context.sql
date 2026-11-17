-- General conversations are owned by senderId (authenticated account).
-- taskId remains a nullable FK: NULL means general/system-wide context.
ALTER TABLE "sofia"."messages" ALTER COLUMN "taskId" DROP NOT NULL;
