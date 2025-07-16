#!/bin/bash
# deploy.sh

echo "📦 Building the site..."
npm run build

echo "🔄 Committing changes..."
git add .
git commit -m 'Auto-deploy commit'
git push origin main

echo "🚀 Deploying to gh-pages..."
npx gh-pages -d dist

echo "✅ Deployment complete!"
