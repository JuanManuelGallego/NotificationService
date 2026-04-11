-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refreshTokenVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/Bogota';
