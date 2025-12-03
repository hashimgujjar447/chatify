-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastRegistrationAttempt" TIMESTAMP(3),
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "isVerified" DROP NOT NULL,
ALTER COLUMN "registrationAttempts" DROP NOT NULL,
ALTER COLUMN "isOnline" DROP NOT NULL;
