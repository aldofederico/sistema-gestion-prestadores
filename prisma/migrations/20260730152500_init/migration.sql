-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "cuit" VARCHAR(11) NOT NULL,
    "businessName" VARCHAR(160) NOT NULL,
    "province" VARCHAR(100),
    "locality" VARCHAR(100),
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(30),
    "status" "ProviderStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_cuit_key" ON "Provider"("cuit");

-- CreateIndex
CREATE INDEX "Provider_status_idx" ON "Provider"("status");

-- CreateIndex
CREATE INDEX "Provider_businessName_idx" ON "Provider"("businessName");
