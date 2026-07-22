import { PrismaClient, CoffeeVariety, BagStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Coffee Tracing Database Seed...');

  // Clean existing data
  await prisma.mergeRelation.deleteMany();
  await prisma.coffeeBag.deleteMany();
  await prisma.farmer.deleteMany();

  // 1. Create Rwandan Farmers
  const farmer1 = await prisma.farmer.create({
    data: {
      code: 'FRM-RWA-001',
      name: 'Jean-Luc Habimana',
      email: 'habimana@huye-mountain-coop.rw',
      phone: '+250-788-111-222',
      region: 'Huye District, Southern Province',
      country: 'Rwanda',
      elevationM: 1850,
    },
  });

  const farmer2 = await prisma.farmer.create({
    data: {
      code: 'FRM-RWA-002',
      name: 'Marie-Claire Mukamana',
      email: 'mukamana@nyamagabe-coffee.rw',
      phone: '+250-788-222-333',
      region: 'Nyamagabe, Southern Province',
      country: 'Rwanda',
      elevationM: 1920,
    },
  });

  const farmer3 = await prisma.farmer.create({
    data: {
      code: 'FRM-RWA-003',
      name: 'Emmanuel Nshimiyimana',
      email: 'emmanuel@gakenke-growers.rw',
      phone: '+250-788-333-444',
      region: 'Gakenke, Northern Province',
      country: 'Rwanda',
      elevationM: 2050,
    },
  });

  const farmer4 = await prisma.farmer.create({
    data: {
      code: 'FRM-RWA-004',
      name: 'Bosco Mugisha',
      email: 'bosco@kivu-belt-farms.rw',
      phone: '+250-788-444-555',
      region: 'Rutsiro, Western Province',
      country: 'Rwanda',
      elevationM: 1750,
    },
  });

  const farmer5 = await prisma.farmer.create({
    data: {
      code: 'FRM-RWA-005',
      name: 'Diane Uwineza',
      email: 'uwineza@rubavu-specialty.rw',
      phone: '+250-788-555-666',
      region: 'Rubavu, Western Province',
      country: 'Rwanda',
      elevationM: 1980,
    },
  });

  const farmer6 = await prisma.farmer.create({
    data: {
      code: 'FRM-RWA-006',
      name: 'Gaspard Ndagijimana',
      email: 'gaspard@gicumbi-highlands.rw',
      phone: '+250-788-666-777',
      region: 'Gicumbi, Northern Province',
      country: 'Rwanda',
      elevationM: 2100,
    },
  });

  console.log('✅ Created 6 Rwandan Farmers.');

  // 2. Create Initial Harvested Bags
  const bagH1 = await prisma.coffeeBag.create({
    data: {
      bagCode: 'BAG-RWA-2026-H1',
      initialWeightKg: 60.0,
      currentWeightKg: 0.0, // Fully merged into M1
      moisturePercent: 11.2,
      qualityScore: 89,
      variety: CoffeeVariety.BOURBON,
      status: BagStatus.MERGED,
      farmerId: farmer1.id,
    },
  });

  const bagA1 = await prisma.coffeeBag.create({
    data: {
      bagCode: 'BAG-2026-A1',
      initialWeightKg: 50.0,
      currentWeightKg: 0.0, // Fully merged
      moisturePercent: 11.0,
      qualityScore: 90,
      variety: CoffeeVariety.BOURBON,
      status: BagStatus.MERGED,
      farmerId: farmer1.id,
    },
  });

  const bagN1 = await prisma.coffeeBag.create({
    data: {
      bagCode: 'BAG-RWA-2026-N1',
      initialWeightKg: 40.0,
      currentWeightKg: 0.0, // Fully merged into M1
      moisturePercent: 10.8,
      qualityScore: 92,
      variety: CoffeeVariety.BOURBON,
      status: BagStatus.MERGED,
      farmerId: farmer2.id,
    },
  });

  const bagG1 = await prisma.coffeeBag.create({
    data: {
      bagCode: 'BAG-RWA-2026-G1',
      initialWeightKg: 50.0,
      currentWeightKg: 0.0, // Fully merged into M2
      moisturePercent: 11.5,
      qualityScore: 88,
      variety: CoffeeVariety.ARABICA,
      status: BagStatus.MERGED,
      farmerId: farmer3.id,
    },
  });

  await prisma.coffeeBag.create({
    data: {
      bagCode: 'BAG-RWA-2026-R1',
      initialWeightKg: 50.0,
      currentWeightKg: 50.0,
      moisturePercent: 11.0,
      qualityScore: 87,
      variety: CoffeeVariety.BOURBON,
      status: BagStatus.IN_STORAGE,
      farmerId: farmer4.id,
    },
  });

  await prisma.coffeeBag.create({
    data: {
      bagCode: 'BAG-RWA-2026-U1',
      initialWeightKg: 75.0,
      currentWeightKg: 75.0,
      moisturePercent: 10.5,
      qualityScore: 94,
      variety: CoffeeVariety.GEISHA,
      status: BagStatus.HARVESTED,
      farmerId: farmer5.id,
    },
  });

  await prisma.coffeeBag.create({
    data: {
      bagCode: 'BAG-RWA-2026-C1',
      initialWeightKg: 65.0,
      currentWeightKg: 65.0,
      moisturePercent: 11.8,
      qualityScore: 86,
      variety: CoffeeVariety.TYPICA,
      status: BagStatus.HARVESTED,
      farmerId: farmer6.id,
    },
  });

  console.log('✅ Created Initial Harvested Rwandan Coffee Bags.');

  // 3. First-Level Merges:
  // Merge H1 + N1 -> COMP-LOT-RWA-M1 (100kg)
  const bagM1 = await prisma.coffeeBag.create({
    data: {
      bagCode: 'COMP-LOT-RWA-M1',
      initialWeightKg: 100.0,
      currentWeightKg: 0.0, // Merged into EXPORT-RWANDA-LOT-01
      moisturePercent: 11.0,
      qualityScore: 91,
      variety: CoffeeVariety.BOURBON,
      status: BagStatus.MERGED,
      farmerId: null,
    },
  });

  await prisma.mergeRelation.createMany({
    data: [
      { parentBagId: bagH1.id, childBagId: bagM1.id, weightUsedKg: 60.0 },
      { parentBagId: bagN1.id, childBagId: bagM1.id, weightUsedKg: 40.0 },
    ],
  });

  // Merge A1 + N1 -> BAG-2026-M1 (90kg)
  const bag2026M1 = await prisma.coffeeBag.create({
    data: {
      bagCode: 'BAG-2026-M1',
      initialWeightKg: 90.0,
      currentWeightKg: 0.0, // Merged into BAG-2026-M2 & EXPORT-SUPER-LOT-01
      moisturePercent: 10.9,
      qualityScore: 91,
      variety: CoffeeVariety.BOURBON,
      status: BagStatus.MERGED,
      farmerId: null,
    },
  });

  await prisma.mergeRelation.createMany({
    data: [
      { parentBagId: bagA1.id, childBagId: bag2026M1.id, weightUsedKg: 50.0 },
      { parentBagId: bagN1.id, childBagId: bag2026M1.id, weightUsedKg: 40.0 },
    ],
  });

  // 4. Second-Level Recursive Merges:
  // M1 + G1 -> EXPORT-RWANDA-LOT-01 (150kg)
  const bagM2 = await prisma.coffeeBag.create({
    data: {
      bagCode: 'EXPORT-RWANDA-LOT-01',
      initialWeightKg: 150.0,
      currentWeightKg: 150.0,
      moisturePercent: 11.1,
      qualityScore: 93,
      variety: CoffeeVariety.BOURBON,
      status: BagStatus.IN_STORAGE,
      farmerId: null,
    },
  });

  await prisma.mergeRelation.createMany({
    data: [
      { parentBagId: bagM1.id, childBagId: bagM2.id, weightUsedKg: 100.0 },
      { parentBagId: bagG1.id, childBagId: bagM2.id, weightUsedKg: 50.0 },
    ],
  });

  // BAG-2026-M1 + G1 -> BAG-2026-M2 (140kg)
  const bag2026M2 = await prisma.coffeeBag.create({
    data: {
      bagCode: 'BAG-2026-M2',
      initialWeightKg: 140.0,
      currentWeightKg: 140.0,
      moisturePercent: 11.0,
      qualityScore: 92,
      variety: CoffeeVariety.BOURBON,
      status: BagStatus.IN_STORAGE,
      farmerId: null,
    },
  });

  await prisma.mergeRelation.createMany({
    data: [
      { parentBagId: bag2026M1.id, childBagId: bag2026M2.id, weightUsedKg: 90.0 },
      { parentBagId: bagG1.id, childBagId: bag2026M2.id, weightUsedKg: 50.0 },
    ],
  });

  // EXPORT-SUPER-LOT-01 (250kg)
  const bagSuperLot = await prisma.coffeeBag.create({
    data: {
      bagCode: 'EXPORT-SUPER-LOT-01',
      initialWeightKg: 250.0,
      currentWeightKg: 250.0,
      moisturePercent: 10.9,
      qualityScore: 95,
      variety: CoffeeVariety.BOURBON,
      status: BagStatus.EXPORTED,
      farmerId: null,
    },
  });

  await prisma.mergeRelation.createMany({
    data: [
      { parentBagId: bagM1.id, childBagId: bagSuperLot.id, weightUsedKg: 100.0 },
      { parentBagId: bag2026M2.id, childBagId: bagSuperLot.id, weightUsedKg: 140.0 },
    ],
  });

  console.log('✅ Successfully established Multi-Tier Recursive Merge Tree including EXPORT-SUPER-LOT-01, BAG-2026-M2, BAG-2026-M1, and BAG-2026-A1.');
  console.log('🌱 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
