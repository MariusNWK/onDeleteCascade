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
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database with test user and related data...");

  // First, let's check if we have any existing users to use as "createdBy" references
  const existingUsers = await prisma.user.findMany({ take: 1 });

  if (existingUsers.length === 0) {
    console.log(
      "⚠️  No existing users found. Creating a second user for 'createdBy' references..."
    );
    await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        gender: "male" as const,
        pseudo: "admin_user",
        phone: "0987654321",
        birthDate: new Date("1985-01-01"),
        personalEmail: "admin@example.com",
        type: "admin" as const,
        borrowedFirstName: "Admin",
        borrowedLastName: "User",
        entryDate: new Date(),
        password: "hashedpassword",
        isAccountActivated: true,
        isBlocked: false,
      },
    });
  }

  // Get the admin user for "createdBy" references
  const adminUser = await prisma.user.findFirst({
    where: { type: "admin" },
  });

  if (!adminUser) {
    throw new Error("Could not find admin user for createdBy references");
  }

  const findUser = await prisma.user.findFirst({
    where: { pseudo: "testuser_benchmark" },
  });

  if (findUser) {
    console.log("🔍 Test user already exists. Skipping creation...");
    return;
  }

  // Create a test user with various related data to test cascade deletion
  const testUser = await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "User",
      gender: "male" as const,
      pseudo: "testuser_benchmark",
      phone: "0123456789",
      birthDate: new Date("1990-01-01"),
      personalEmail: "testuser@benchmark.com",
      type: "worker" as const,
      borrowedFirstName: "Test",
      borrowedLastName: "User",
      entryDate: new Date(),
      password: "hashedpassword",
      isAccountActivated: true,
      isBlocked: false,

      // Create related documents
      documents: {
        create: [
          {
            type: "identityCard" as const,
            url: "https://example.com/test-identity.jpg",
          },
          {
            type: "contract" as const,
            url: "https://example.com/test-cv.pdf",
          },
        ],
      },

      // Create user comments
      comments: {
        create: [
          {
            message: "Test comment 1",
            createdById: adminUser.id,
          },
          {
            message: "Test comment 2",
            createdById: adminUser.id,
          },
        ],
      },

      // Create user history entries
      histories: {
        create: [
          {
            message: "Test history entry 1",
            createdById: adminUser.id,
          },
        ],
      },

      // Create time off periods
      timeOffPeriods: {
        create: [
          {
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            timeOffType: "PAID_TIME_OFF" as const,
            comment: "Vacation",
            monthOfTimeOff: new Date(),
            numberOfDays: 7,
          },
        ],
      },

      // Create absence reasons
      absenceReasons: {
        create: [
          {
            reason: "Medical appointment",
            absenceDate: new Date(),
          },
        ],
      },
    },
  });

  console.log(`✅ Test user created with ID: ${testUser.id}`);
  console.log("📊 Created related data:");
  console.log("  - 2 UserDocuments");
  console.log("  - 2 UserComments");
  console.log("  - 1 UserHistory");
  console.log("  - 1 TimeOffPeriod");
  console.log("  - 1 AbsenceReason");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
