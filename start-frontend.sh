#!/bin/bash

# Psychedelic Website Frontend Starter
# This script runs the React frontend application independently

echo "🌸 Starting Psychedelic Hub Frontend..."

# Check if we're in the correct directory
if [ ! -f "client/src/main.tsx" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables
export VITE_API_BASE_URL="https://hippie-sciences.onrender.com/api"

# Start Vite dev server for client
echo "🚀 Starting Vite development server..."
echo "🌐 Open http://localhost:3000 in your browser"
echo "💡 Press Ctrl+C to stop the server"

npx vite --config vite.config.client.ts