#!/bin/bash

# PestPros AI Sales Trainer - Installation Script
# This script automates the setup process

set -e

echo "🚀 PestPros AI Sales Trainer - Installation"
echo "==========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Dependencies installed"
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Copying .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local (please edit with your API keys)"
    echo ""
    echo "📝 Edit .env.local with:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - OPENAI_API_KEY"
    echo "   - STRIPE_SECRET_KEY (optional)"
    echo ""
fi

# Build check
echo "🔨 Checking TypeScript compilation..."
npm run build > /dev/null 2>&1 && echo "✅ TypeScript compilation successful" || echo "⚠️  Compilation warning (check npm run lint)"

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - QUICKSTART.md - 5-minute setup"
echo "   - README.md - Full guide"
echo "   - docs/DEPLOYMENT.md - Vercel deployment"
echo ""
