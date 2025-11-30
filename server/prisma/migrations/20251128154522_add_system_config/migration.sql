-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" SERIAL NOT NULL,
    "new_product_duration" INTEGER NOT NULL DEFAULT 60,
    "anti_sniping_trigger" INTEGER NOT NULL DEFAULT 5,
    "anti_sniping_extension" INTEGER NOT NULL DEFAULT 3,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);
