-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Bidder', 'Seller', 'Admin');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('Pending', 'Active', 'Sold', 'Expired', 'Removed');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "RatingScore" AS ENUM ('Positive', 'Negative');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PendingPayment', 'PendingShipping', 'PendingReceipt', 'Completed', 'Cancelled');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "address" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "google_id" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'Bidder',
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "rating_plus" INTEGER NOT NULL DEFAULT 0,
    "rating_minus" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerUpgradeRequest" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'Pending',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin_id" INTEGER,

    CONSTRAINT "SellerUpgradeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3) NOT NULL,
    "start_price" BIGINT NOT NULL,
    "step_price" BIGINT NOT NULL,
    "buy_now_price" BIGINT,
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProductStatus" NOT NULL DEFAULT 'Pending',
    "current_price" BIGINT NOT NULL,
    "bid_count" INTEGER NOT NULL DEFAULT 0,
    "seller_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "current_bidder_id" INTEGER,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoBid" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "max_price" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutoBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidHistory" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "bid_price" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BidHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchList" (
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "WatchList_pkey" PRIMARY KEY ("user_id","product_id")
);

-- CreateTable
CREATE TABLE "QnA" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "questioner_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answer_text" TEXT,
    "answer_time" TIMESTAMP(3),

    CONSTRAINT "QnA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannedBidder" (
    "product_id" INTEGER NOT NULL,
    "bidder_id" INTEGER NOT NULL,

    CONSTRAINT "BannedBidder_pkey" PRIMARY KEY ("product_id","bidder_id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "winner_id" INTEGER NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "final_price" BIGINT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PendingPayment',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shipping_address" TEXT,
    "payment_invoice_url" TEXT,
    "seller_confirmed_at" TIMESTAMP(3),
    "shipping_invoice_url" TEXT,
    "buyer_confirmed_at" TIMESTAMP(3),
    "cancel_reason" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "rated_user_id" INTEGER NOT NULL,
    "score" "RatingScore" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Otp_email_idx" ON "Otp"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SellerUpgradeRequest_user_id_key" ON "SellerUpgradeRequest"("user_id");

-- CreateIndex
CREATE INDEX "Product_end_time_idx" ON "Product"("end_time");

-- CreateIndex
CREATE INDEX "Product_bid_count_idx" ON "Product"("bid_count");

-- CreateIndex
CREATE INDEX "Product_current_price_idx" ON "Product"("current_price");

-- CreateIndex
CREATE INDEX "Product_category_id_idx" ON "Product"("category_id");

-- CreateIndex
CREATE INDEX "Product_seller_id_idx" ON "Product"("seller_id");

-- CreateIndex
CREATE INDEX "AutoBid_product_id_idx" ON "AutoBid"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "AutoBid_user_id_product_id_key" ON "AutoBid"("user_id", "product_id");

-- CreateIndex
CREATE INDEX "BidHistory_product_id_idx" ON "BidHistory"("product_id");

-- CreateIndex
CREATE INDEX "QnA_product_id_idx" ON "QnA"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_product_id_key" ON "Transaction"("product_id");

-- CreateIndex
CREATE INDEX "Transaction_winner_id_idx" ON "Transaction"("winner_id");

-- CreateIndex
CREATE INDEX "Transaction_seller_id_idx" ON "Transaction"("seller_id");

-- CreateIndex
CREATE INDEX "Rating_rated_user_id_idx" ON "Rating"("rated_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_transaction_id_rater_id_key" ON "Rating"("transaction_id", "rater_id");

-- CreateIndex
CREATE INDEX "ChatMessage_transaction_id_idx" ON "ChatMessage"("transaction_id");

-- AddForeignKey
ALTER TABLE "SellerUpgradeRequest" ADD CONSTRAINT "SellerUpgradeRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerUpgradeRequest" ADD CONSTRAINT "SellerUpgradeRequest_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_current_bidder_id_fkey" FOREIGN KEY ("current_bidder_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoBid" ADD CONSTRAINT "AutoBid_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoBid" ADD CONSTRAINT "AutoBid_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidHistory" ADD CONSTRAINT "BidHistory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidHistory" ADD CONSTRAINT "BidHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchList" ADD CONSTRAINT "WatchList_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchList" ADD CONSTRAINT "WatchList_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QnA" ADD CONSTRAINT "QnA_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QnA" ADD CONSTRAINT "QnA_questioner_id_fkey" FOREIGN KEY ("questioner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedBidder" ADD CONSTRAINT "BannedBidder_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedBidder" ADD CONSTRAINT "BannedBidder_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_rater_id_fkey" FOREIGN KEY ("rater_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_rated_user_id_fkey" FOREIGN KEY ("rated_user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
