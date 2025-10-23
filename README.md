# Prisma Cascade Benchmark

This project compares the performance of `onDelete: Cascade` between two variants of Prisma 6.16.3:

- **Classic version** (`old/`) : Uses the default Rust engine with `provider = "prisma-client-js"` + PlanetScale adapter
- **Rust-free version** (`new/`) : Uses the client engine with `provider = "prisma-client"` and `engineType = "client"` + PlanetScale adapter

**Testing approach**: Instead of using separate test models, we create a test `User` with all its related data (documents, comments, history, time off, etc.) and measure the cascade deletion time. This allows testing performance on your real schema without polluting your existing data.

## 🏗️ Project Structure

```
prisma-cascade-benchmark/
├── old/               # Classic Prisma configuration (Rust engine)
│   ├── db.ts          # PrismaClient with Rust engine
│   ├── package.json   # Dependencies for old/
│   └── prisma/
│       └── schema.prisma  # Schema with provider="prisma-client-js"
├── new/               # Rust-free Prisma configuration
│   ├── db.ts          # PrismaClient with engineType="client"
│   ├── package.json   # Dependencies for new/
│   └── prisma/
│       └── schema.prisma  # Schema with provider="prisma-client" + engineType="client"
├── seed.ts            # Common seed script
├── script.ts          # Common benchmark script
├── package.json       # Common dependencies
├── tsconfig.json      # Common TypeScript configuration
├── env.example        # Configuration example
├── benchmark-old.sh   # Script to run old benchmark
├── benchmark-new.sh   # Script to run new benchmark
├── seed-old.sh        # Script to run old seed
├── seed-new.sh        # Script to run new seed
└── README.md
```

## 🎯 Key Concept

**The `seed.ts` and `script.ts` files are identical** - they simply use `import { prisma } from "./db"`. The only differences are:

- `old/db.ts` : Classic Prisma configuration with Rust engine
- `new/db.ts` : Rust-free Prisma configuration with `engineType = "client"`
- `old/prisma/schema.prisma` : `provider = "prisma-client-js"` (Rust engine)
- `new/prisma/schema.prisma` : `provider = "prisma-client"` + `engineType = "client"` (Rust-free)

This highlights that **performance differences come solely from PrismaClient and generator configuration**, not from business logic.

## 🚀 Installation and Usage

### Option 1: Quick Start (Recommended)

```bash
# Install dependencies
yarn install
cd old && yarn install && cd ..
cd new && yarn install && cd ..

# Environment configuration
cp env.example old/.env
cp env.example new/.env

# Edit .env files with your PlanetScale URL
# DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/database-name?sslaccept=strict"

# Generate Prisma clients and push schemas
cd old && yarn generate && cd ..
cd new && yarn generate && cd ..
cd old && yarn db:push && cd ..  # ⚠️ Check warning messages
cd new && yarn db:push && cd ..  # ⚠️ Check warning messages

# Seed test data
./seed-old.sh
./seed-new.sh

# Run benchmarks
./benchmark-old.sh
./benchmark-new.sh
```

### Option 2: Manual Installation

1. **Prerequisites**

- Node.js (version 18+)
- Yarn
- PlanetScale account with MySQL database

2. **Environment Configuration**

```bash
# Copy example files
cp env.example old/.env
cp env.example new/.env
```

Then edit the `.env` files with your real PlanetScale URL:
```
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/database-name?sslaccept=strict"
```

3. **Install Dependencies**

```bash
# Install dependencies in each folder
cd old && yarn install && cd ..
cd new && yarn install && cd ..
```

4. **Generation and Migration**

```bash
# Generate Prisma clients for both versions
cd old && yarn generate && cd ..
cd new && yarn generate && cd ..

# Push schemas to database (⚠️ Check warning messages)
cd old && yarn db:push && cd ..
cd new && yarn db:push && cd ..
```

5. **Seed Test Data**

```bash
# Seed with Classic Prisma
./seed-old.sh

# Seed with Rust-free Prisma
./seed-new.sh
```

6. **Benchmarks**

```bash
# Benchmark Classic Prisma (Rust engine)
./benchmark-old.sh

# Benchmark Rust-free Prisma (engineType="client")
./benchmark-new.sh
```

## ⚠️ Security and Best Practices

**IMPORTANT**: This project uses your real PlanetScale database with your existing schema.

### Before running `yarn db:push`:

1. **Check warning messages**: Prisma will tell you exactly what modifications will be made
2. **Backup your data** if necessary
3. **Test first on a development branch** of your PlanetScale database

### Security guaranteed if:
- ✅ You use your existing schema without modification
- ✅ The test only creates a user with `pseudo: "testuser_benchmark"`
- ✅ No existing data is modified

## 📊 Expected Results

The benchmark script will display the execution time for cascade deletion of a user:

```
🚀 Starting benchmark for Prisma with PlanetScale...
📊 Found test user with ID: 123
📈 Related data to be deleted:
  - 2 UserDocuments
  - 2 UserComments
  - 1 UserHistories
  - 1 TimeOffPeriods
  - 1 AbsenceReasons
delete-user-cascade: 45.123ms
✅ Benchmark completed!
```

Compare the `delete-user-cascade` times between the two versions to see the performance difference.

## 🔍 What is Tested

The benchmark tests the deletion of a user that automatically triggers cascade deletion of:
- Their documents (`UserDocument`)
- Their comments (`UserComment`)
- Their history (`UserHistory`)
- Their time off periods (`TimeOffPeriod`)
- Their absence reasons (`AbsenceReason`)

The test creates a user with:
- 2 documents (identity card and contract)
- 2 user comments
- 1 history entry
- 1 paid time off period
- 1 absence reason

## 🛠️ Utility Scripts

The project includes several scripts to facilitate usage:

- `./seed-old.sh` : Seed with Classic Prisma
- `./seed-new.sh` : Seed with Rust-free Prisma
- `./benchmark-old.sh` : Benchmark Classic Prisma
- `./benchmark-new.sh` : Benchmark Rust-free Prisma

## 🧹 Cleanup

Test data is stored in your PlanetScale database with the identifier `pseudo: "testuser_benchmark"`. 

To clean up test data:
```bash
# Data is automatically deleted during the benchmark
# Or you can delete it manually via the PlanetScale interface
```

## 📝 Technical Notes

- **Prisma 6.16.3**: Version used for both variants
- **PlanetScale**: Cloud MySQL database used for tests
- **TypeScript**: Common configuration for both projects
- **Yarn**: Package manager used
- **Architecture**: Common files + specific configurations in `db.ts`

## 🤝 Contributing

This project is designed to be easily shareable and reproducible. Feel free to:
- Add other types of benchmarks
- Test with other databases
- Compare with other Prisma versions