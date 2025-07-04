#!/bin/bash

# Build script for frontend deployment
echo "🔨 Building Psychedelic Hub for deployment..."

# Create build directory structure
mkdir -p dist

# Build the frontend application using the client config
echo "🚀 Building React application..."
npx vite build --config vite.config.client.ts

# Copy additional assets
echo "📁 Copying assets..."
cp -r public/* dist/ 2>/dev/null || true

# Create _redirects for Netlify SPA routing
echo "📝 Creating Netlify redirects..."
echo "/*    /index.html   200" > dist/_redirects

# Create netlify.toml for configuration
cat > dist/netlify.toml << EOF
[build]
  publish = "."
  command = "echo 'Built with external script'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_BASE_URL = "https://hippie-sciences.onrender.com/api"
EOF

echo "✅ Build complete! Deploy the 'dist' folder to Netlify."
echo "🌐 Ready for drag-and-drop deployment!"

# Display build info
echo ""
echo "📊 Build Summary:"
echo "- Output directory: ./dist"
echo "- Ready for: Netlify, Vercel, GitHub Pages"
echo "- API endpoint: https://hippie-sciences.onrender.com/api"
echo "- Features: React + Vite + Tailwind CSS"