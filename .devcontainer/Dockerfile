At FROM node:20-slim

RUN npm install -g npm@latest

RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
