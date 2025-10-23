import { Client } from "@planetscale/database";
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";
import { PrismaClient } from "./prisma/generated/client";
import { fetch as undiciFetch } from "undici";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
console.log("🔍 DATABASE_URL:", databaseUrl ? "✅ Set" : "❌ Not set");

if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  process.exit(1);
}

const client = new Client({
  url: databaseUrl,
  fetch: undiciFetch,
});
const adapter = new PrismaPlanetScale(client);
const prisma = new PrismaClient({
  adapter,
  transactionOptions: {
    timeout: 45000,
  },
});

async function main() {
  console.log("🚀 Starting benchmark for Prisma Rust-free with PlanetScale...");

  // Find the test user created by the seed
  const testUser = await prisma.user.findFirst({
    where: { pseudo: "testuser_benchmark" },
  });

  if (!testUser) {
    console.error("❌ No test user found. Please run 'yarn seed' first.");
    process.exit(1);
  }

  console.log(`📊 Found test user with ID: ${testUser.id}`);

  // Count related data before deletion to verify cascade
  const documentsCount = await prisma.userDocument.count({
    where: { userId: testUser.id },
  });
  const commentsCount = await prisma.userComment.count({
    where: { userId: testUser.id },
  });
  const historiesCount = await prisma.userHistory.count({
    where: { itemId: testUser.id },
  });
  const timeOffCount = await prisma.timeOffPeriod.count({
    where: { userId: testUser.id },
  });
  const absenceCount = await prisma.absenceReason.count({
    where: { userId: testUser.id },
  });

  console.log("📈 Related data to be deleted:");
  console.log(`  - ${documentsCount} UserDocuments`);
  console.log(`  - ${commentsCount} UserComments`);
  console.log(`  - ${historiesCount} UserHistories`);
  console.log(`  - ${timeOffCount} TimeOffPeriods`);
  console.log(`  - ${absenceCount} AbsenceReasons`);

  // Test cascade delete performance
  console.time("~ ~ ~ ~ ~delete-user-cascade~ ~ ~ ~ ~");
  await prisma.user.delete({ where: { id: testUser.id } });
  console.timeEnd("~ ~ ~ ~ ~delete-user-cascade~ ~ ~ ~ ~");

  console.log("✅ Benchmark completed!");
  console.log("🎯 All related data should have been cascade deleted");
}

main()
  .catch((e) => {
    console.error("❌ Benchmark failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
