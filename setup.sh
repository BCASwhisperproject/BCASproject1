#!/bin/bash
# BCAS Whisper — First-time setup script
echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "📋 Pushing schema to database..."
echo "(Make sure DATABASE_URL is set in .env.local first)"
npx prisma db push

echo "✅ Setup complete! Run: npm run dev"
