-- CreateEnum
CREATE TYPE "BagStatus" AS ENUM ('HARVESTED', 'IN_STORAGE', 'MERGED', 'EXPORTED');

-- CreateEnum
CREATE TYPE "CoffeeVariety" AS ENUM ('ARABICA', 'ROBUSTA', 'TYPICA', 'BOURBON', 'GEISHA');

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "region" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Rwanda',
    "elevationM" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeBag" (
    "id" TEXT NOT NULL,
    "bagCode" TEXT NOT NULL,
    "initialWeightKg" DOUBLE PRECISION NOT NULL,
    "currentWeightKg" DOUBLE PRECISION NOT NULL,
    "moisturePercent" DOUBLE PRECISION,
    "qualityScore" INTEGER,
    "variety" "CoffeeVariety" NOT NULL DEFAULT 'ARABICA',
    "status" "BagStatus" NOT NULL DEFAULT 'HARVESTED',
    "farmerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoffeeBag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MergeRelation" (
    "id" TEXT NOT NULL,
    "parentBagId" TEXT NOT NULL,
    "childBagId" TEXT NOT NULL,
    "weightUsedKg" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MergeRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_code_key" ON "Farmer"("code");

-- CreateIndex
CREATE INDEX "Farmer_code_idx" ON "Farmer"("code");

-- CreateIndex
CREATE INDEX "Farmer_region_idx" ON "Farmer"("region");

-- CreateIndex
CREATE INDEX "Farmer_createdAt_idx" ON "Farmer"("createdAt");

-- CreateIndex
CREATE INDEX "Farmer_name_idx" ON "Farmer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CoffeeBag_bagCode_key" ON "CoffeeBag"("bagCode");

-- CreateIndex
CREATE INDEX "CoffeeBag_bagCode_idx" ON "CoffeeBag"("bagCode");

-- CreateIndex
CREATE INDEX "CoffeeBag_farmerId_idx" ON "CoffeeBag"("farmerId");

-- CreateIndex
CREATE INDEX "CoffeeBag_createdAt_idx" ON "CoffeeBag"("createdAt");

-- CreateIndex
CREATE INDEX "CoffeeBag_status_createdAt_idx" ON "CoffeeBag"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CoffeeBag_variety_status_idx" ON "CoffeeBag"("variety", "status");

-- CreateIndex
CREATE INDEX "CoffeeBag_farmerId_status_idx" ON "CoffeeBag"("farmerId", "status");

-- CreateIndex
CREATE INDEX "MergeRelation_parentBagId_idx" ON "MergeRelation"("parentBagId");

-- CreateIndex
CREATE INDEX "MergeRelation_childBagId_idx" ON "MergeRelation"("childBagId");

-- CreateIndex
CREATE INDEX "MergeRelation_childBagId_parentBagId_idx" ON "MergeRelation"("childBagId", "parentBagId");

-- CreateIndex
CREATE UNIQUE INDEX "MergeRelation_parentBagId_childBagId_key" ON "MergeRelation"("parentBagId", "childBagId");

-- AddForeignKey
ALTER TABLE "CoffeeBag" ADD CONSTRAINT "CoffeeBag_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MergeRelation" ADD CONSTRAINT "MergeRelation_parentBagId_fkey" FOREIGN KEY ("parentBagId") REFERENCES "CoffeeBag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MergeRelation" ADD CONSTRAINT "MergeRelation_childBagId_fkey" FOREIGN KEY ("childBagId") REFERENCES "CoffeeBag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
