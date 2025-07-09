#!/bin/bash
echo "Setting up Hippie Scientist development environment..."

# Install dependencies
npm install

# Format existing code
npm run format

# Run linting
npm run lint:fix

# Build project
npm run build

echo "Setup complete! Run 'npm run dev' to start development server."
