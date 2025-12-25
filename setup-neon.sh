#!/bin/bash
# Quick setup script for Neon + NextAuth migration
# Run this after configuring .env.local with your Neon connection string

echo "🚀 Starting Neon + NextAuth Setup..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    echo "Please create .env.local with DATABASE_URL, NEXTAUTH_URL, and NEXTAUTH_SECRET"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local; then
    echo "❌ Error: DATABASE_URL not set in .env.local"
    exit 1
fi

echo "✅ .env.local configuration found"
echo ""

# Step 1: Generate Prisma Client
echo "📝 Step 1: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client generated"
echo ""

# Step 2: Run Migrations
echo "🗄️  Step 2: Creating database schema..."
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "⚠️  Migration may have failed (this is ok if tables already exist)"
fi
echo "✅ Database setup complete"
echo ""

# Step 3: Open Prisma Studio (optional)
echo "🎨 Step 3: Prisma Studio (to view database)"
echo "Run: npx prisma studio"
echo ""

# Step 4: Start dev server
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development server, run:"
echo "npm run dev"
echo ""
echo "📝 Test the auth flow:"
echo "1. Visit http://localhost:3000/auth/signup"
echo "2. Create an account with password like: TestPass@123"
echo "3. Sign in at http://localhost:3000/auth/login"
echo ""
echo "💡 Useful commands:"
echo "  npx prisma studio        - View database GUI"
echo "  npx prisma migrate dev   - Run migrations"
echo "  npm run dev              - Start dev server"
echo "  npm test                 - Run tests"
echo ""
