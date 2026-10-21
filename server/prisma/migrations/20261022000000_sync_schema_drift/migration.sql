-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'Banned';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "allow_low_rating_bid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allow_no_rating_bid" BOOLEAN NOT NULL DEFAULT true;
