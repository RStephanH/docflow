#!/bin/bash

# Frontend Setup Script - React + Vite + TypeScript

echo "🎨 Setting up Frontend (React + Vite)..."

cd pdf-generator/frontend || exit

echo "📦 Initializing npm package..."
npm init -y

echo "📦 Installing Vite and React dependencies..."
npm install react react-dom

echo "📦 Installing Vite as dev dependency..."
npm install -D vite @vitejs/plugin-react

echo "📦 Installing TypeScript dependencies..."
npm install -D typescript @types/react @types/react-dom

echo "📦 Installing Axios for API calls..."
npm install axios

echo "📦 Installing additional development tools..."
npm install -D eslint vite-tsconfig-paths

echo "✅ Frontend dependencies installed!"
echo ""
echo "📝 Update your package.json scripts with:"
echo '  "scripts": {'
echo '    "dev": "vite",'
echo '    "build": "tsc && vite build",'
echo '    "preview": "vite preview"'
echo '  }'
echo ""
echo "🚀 To start development: npm run dev"
