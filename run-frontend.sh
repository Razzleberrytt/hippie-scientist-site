#!/bin/bash

# PsycheCo Frontend Standalone Runner
# This script sets up and runs the frontend application independently

echo "🚀 Starting PsycheCo Frontend Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm with Node.js"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    
    # Create a simple package.json for frontend only
    cat > package.json << 'EOF'
{
  "name": "psycheco-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.7"
  }
}
EOF

    # Create simple vite config
    cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true
  }
})
EOF

    npm install
fi

# Start the development server
echo "🌟 Starting development server on port 3000..."
echo "🔗 Open http://localhost:3000 in your browser"
echo "💡 Press Ctrl+C to stop the server"

npm run dev