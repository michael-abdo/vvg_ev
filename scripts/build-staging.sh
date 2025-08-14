#!/bin/bash

# Build script for staging environment

echo "Building staging environment..."

# Clean previous build
rm -rf .next-staging

# Use dotenv-cli to load .env.staging over .env
# First install if not present
if ! command -v dotenv &> /dev/null; then
    echo "Installing dotenv-cli..."
    npm install -g dotenv-cli
fi

# Build with staging configuration
# Load .env first, then .env.staging overrides
dotenv -e .env -e .env.staging -- npm run build

# Move build to staging directory
mv .next .next-staging

echo "Staging build complete!"