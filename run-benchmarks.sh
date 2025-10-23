#!/bin/bash

echo "🏁 Running Complete Prisma Cascade Benchmark with PlanetScale"
echo "=============================================================="

# Check if .env files exist
if [ ! -f "old/.env" ]; then
    echo "❌ old/.env not found. Please copy old/env.example to old/.env and configure your PlanetScale URL."
    exit 1
fi

if [ ! -f "new/.env" ]; then
    echo "❌ new/.env not found. Please copy new/env.example to new/.env and configure your PlanetScale URL."
    exit 1
fi

# Function to run benchmark for a specific version
run_benchmark() {
    local version=$1
    local folder=$2
    
    echo ""
    echo "🔄 Setting up $version..."
    cd "$folder"
    
    echo "📦 Installing dependencies..."
    yarn install --silent
    
    echo "🔧 Generating Prisma client..."
    yarn generate
    
    echo "🗄️  Pushing schema to PlanetScale..."
    yarn db:push
    
    echo "🌱 Seeding database..."
    yarn seed
    
    echo "⚡ Running benchmark..."
    yarn dev
    
    cd ..
}

# Run both benchmarks
run_benchmark "Prisma Classic (Rust Engine) with PlanetScale" "old"
run_benchmark "Prisma Rust-free with PlanetScale" "new"

echo ""
echo "🎉 Benchmark completed!"
echo ""
echo "Compare the 'delete-testuser-cascade' times above to see the performance difference."
echo ""
echo "📊 Both versions now use PlanetScale for a fair comparison:"
echo "  - Classic: Rust engine + PlanetScale adapter"
echo "  - Rust-free: Client engine + PlanetScale adapter"
