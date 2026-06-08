FROM node:20-slim

# Update npm
RUN npm install -g npm@latest

# Install build tools required for Next.js native modules (SWC, Sharp, etc.)
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
