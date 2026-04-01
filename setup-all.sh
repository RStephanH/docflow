#!/bin/bash

# Complete Setup Script - Runs all setup scripts in sequence

echo "🚀 PDF Generator - Complete Setup"
echo "=================================="
echo ""

# Make all scripts executable
chmod +x setup-project.sh
chmod +x setup-frontend.sh
chmod +x setup-backend.sh

# Create project structure
echo "Step 1: Creating project structure..."
./setup-project.sh

echo ""
echo "=================================="
echo ""

# Setup frontend
echo "Step 2: Setting up frontend..."
./setup-frontend.sh

echo ""
echo "=================================="
echo ""

# Setup backend
echo "Step 3: Setting up backend..."
./setup-backend.sh

echo ""
echo "=================================="
echo ""
echo "✅ Complete setup finished!"
echo ""
echo "📋 Next steps:"
echo "1. Navigate to pdf-generator/ directory"
echo "2. Copy .env.example to .env and configure your environment variables"
echo "3. Set up your docker-compose.yml for MongoDB and other services"
echo "4. Start frontend: cd frontend && npm run dev"
echo "5. Start backend: cd backend && npm run dev"
