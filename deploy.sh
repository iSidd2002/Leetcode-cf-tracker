#!/bin/bash

# LeetCode + CodeForces Tracker Deployment Script
echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend build successful"

# Build backend
echo "📦 Building backend..."
cd server
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi

echo "✅ Backend build successful"
cd ..

echo "🎉 Build process completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy frontend: vercel --prod"
echo "2. Deploy backend: cd server && railway up"
echo "3. Update environment variables on both platforms"
echo "4. Test your deployed application"
echo ""
echo "🔗 Useful links:"
echo "- Frontend (Vercel): https://vercel.com"
echo "- Backend (Railway): https://railway.app"
echo "- Database (MongoDB): https://mongodb.com/atlas"
