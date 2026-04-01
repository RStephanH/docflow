#!/bin/bash

# Backend Setup Script - Node.js + Express + TypeScript + MongoDB

echo "⚙️  Setting up Backend (Node.js + Express + TypeScript)..."

cd pdf-generator/backend || exit

echo "📦 Initializing npm package..."
npm init -y

echo "📦 Installing Express and core dependencies..."
npm install express cors dotenv

echo "📦 Installing MongoDB/Mongoose..."
npm install mongoose

echo "📦 Installing PDF generation libraries..."
npm install puppeteer pdfkit

echo "📦 Installing TypeScript and type definitions..."
npm install -D typescript @types/node @types/express @types/cors

echo "📦 Installing development tools..."
npm install -D ts-node nodemon tsx

echo "📦 Installing additional utilities..."
npm install express-validator

echo "✅ Backend dependencies installed!"
echo ""
echo "📝 Update your package.json scripts with:"
echo '  "scripts": {'
echo '    "dev": "nodemon --exec tsx src/index.ts",'
echo '    "build": "tsc",'
echo '    "start": "node dist/index.js"'
echo '  }'
echo ""
echo "🚀 To start development: npm run dev"
