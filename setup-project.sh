#!/bin/bash

# PDF Generator Project Setup Script
# This script creates the complete directory structure for the PDF generator application

echo "🚀 Creating PDF Generator Project Structure..."

# Create main project directory
mkdir -p pdf-generator
cd pdf-generator

echo "📁 Creating root configuration files..."
# Create root level files
touch docker-compose.yml
touch .env.example

echo "📁 Creating frontend structure..."
# Create frontend directories
mkdir -p frontend/src/{components,pages,api}
cd frontend
touch Dockerfile
touch vite.config.ts
cd ..

echo "📁 Creating backend structure..."
# Create backend directories
mkdir -p backend/src/{routes,services,models}
cd backend
touch Dockerfile
touch tsconfig.json

# Create backend source files
touch src/index.ts
touch src/routes/documents.ts
touch src/services/pdfService.ts
touch src/services/dbService.ts
touch src/models/Document.ts
cd ..

echo "📁 Creating mongo-init structure..."
# Create mongo-init directory
mkdir -p mongo-init
touch mongo-init/init.js

echo "✅ Project structure created successfully!"
echo ""
echo "📦 Next steps:"
echo "1. Run './setup-frontend.sh' to initialize the frontend"
echo "2. Run './setup-backend.sh' to initialize the backend"
echo "3. Configure your .env file based on .env.example"
echo ""

# Display the tree structure
echo "📂 Project structure:"
echo "pdf-generator/"
echo "├── docker-compose.yml"
echo "├── .env.example"
echo "├── frontend/"
echo "│   ├── Dockerfile"
echo "│   ├── src/"
echo "│   │   ├── components/"
echo "│   │   ├── pages/"
echo "│   │   └── api/"
echo "│   └── vite.config.ts"
echo "├── backend/"
echo "│   ├── Dockerfile"
echo "│   ├── src/"
echo "│   │   ├── routes/"
echo "│   │   │   └── documents.ts"
echo "│   │   ├── services/"
echo "│   │   │   ├── pdfService.ts"
echo "│   │   │   └── dbService.ts"
echo "│   │   ├── models/"
echo "│   │   │   └── Document.ts"
echo "│   │   └── index.ts"
echo "│   └── tsconfig.json"
echo "└── mongo-init/"
echo "    └── init.js"
