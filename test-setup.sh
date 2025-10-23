#!/bin/bash

echo "🧪 Testing Prisma Cascade Benchmark Setup with PlanetScale"
echo "=========================================================="

# Check project structure
echo "📁 Checking project structure..."

required_files=(
    "old/prisma/schema.prisma"
    "old/package.json"
    "old/tsconfig.json"
    "old/env.example"
    "old/seed.ts"
    "old/script.ts"
    "new/prisma/schema.prisma"
    "new/package.json"
    "new/tsconfig.json"
    "new/env.example"
    "new/seed.ts"
    "new/script.ts"
    "README.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
    fi
done

echo ""
echo "🔍 Checking Prisma schema differences..."

# Check if old schema uses prisma-client-js
if grep -q 'provider = "prisma-client-js"' old/prisma/schema.prisma; then
    echo "✅ Old schema uses prisma-client-js (Rust engine)"
else
    echo "❌ Old schema should use prisma-client-js"
fi

# Check if new schema uses prisma-client with engineType
if grep -q 'provider.*=.*"prisma-client"' new/prisma/schema.prisma && grep -q 'engineType.*=.*"client"' new/prisma/schema.prisma; then
    echo "✅ New schema uses prisma-client with engineType=client (Rust-free)"
else
    echo "❌ New schema should use prisma-client with engineType=client"
fi

# Check if both schemas use PlanetScale
if grep -q 'relationMode.*=.*"prisma"' old/prisma/schema.prisma && grep -q 'relationMode.*=.*"prisma"' new/prisma/schema.prisma; then
    echo "✅ Both schemas configured for PlanetScale (relationMode=prisma)"
else
    echo "❌ Both schemas should use relationMode=prisma for PlanetScale"
fi

echo ""
echo "📦 Checking package.json dependencies..."

# Check old package.json
if grep -q '"@prisma/adapter-planetscale"' old/package.json && grep -q '"@planetscale/database"' old/package.json; then
    echo "✅ Old package.json has PlanetScale dependencies"
else
    echo "❌ Old package.json missing PlanetScale dependencies"
fi

# Check new package.json
if grep -q '"@prisma/adapter-planetscale"' new/package.json && grep -q '"@planetscale/database"' new/package.json; then
    echo "✅ New package.json has PlanetScale dependencies"
else
    echo "❌ New package.json missing PlanetScale dependencies"
fi

echo ""
echo "🌐 Checking environment configuration..."

if [ -f "old/.env" ]; then
    echo "✅ old/.env exists"
else
    echo "⚠️  old/.env missing - copy old/env.example to old/.env and configure PlanetScale URL"
fi

if [ -f "new/.env" ]; then
    echo "✅ new/.env exists"
else
    echo "⚠️  new/.env missing - copy new/env.example to new/.env and configure PlanetScale URL"
fi

echo ""
echo "🎯 Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Configure PlanetScale URLs: cp old/env.example old/.env && cp new/env.example new/.env"
echo "2. Edit both .env files with your PlanetScale database URLs"
echo "3. Run benchmarks: ./run-benchmarks.sh"
