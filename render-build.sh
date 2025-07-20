#!/bin/bash

# Render Build Script for LeetCode CF Tracker
set -e

echo "🚀 Starting Render deployment build..."

# Determine which service to build based on environment or argument
SERVICE_TYPE=${1:-"backend"}

if [ "$SERVICE_TYPE" = "backend" ]; then
    echo "📦 Building Backend Service..."
    
    # Navigate to server directory
    cd server
    
    # Install dependencies
    echo "Installing backend dependencies..."
    npm ci --only=production
    
    # Build TypeScript
    echo "Building TypeScript..."
    npm run build
    
    echo "✅ Backend build completed!"
    
elif [ "$SERVICE_TYPE" = "frontend" ]; then
    echo "🎨 Building Frontend Service..."
    
    # Navigate to frontend directory
    cd Leetcode-cf-tracker
    
    # Install dependencies
    echo "Installing frontend dependencies..."
    npm ci
    
    # Build the frontend
    echo "Building frontend..."
    npm run build
    
    echo "✅ Frontend build completed!"
    
else
    echo "❌ Invalid service type. Use 'backend' or 'frontend'"
    exit 1
fi

echo "🎉 Build process completed successfully!"
