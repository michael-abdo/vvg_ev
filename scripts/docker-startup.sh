#!/bin/bash

# Docker Startup Script for VVG Template
echo "🐳 VVG Template Docker Setup"
echo "=============================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first:"
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running."
    echo ""
    echo "Please start Docker Desktop:"
    echo "  1. Open Docker Desktop application"
    echo "  2. Wait for Docker to start (green status indicator)"
    echo "  3. Run this script again"
    echo ""
    echo "Or start Docker from command line:"
    echo "  sudo systemctl start docker    # Linux"
    echo "  open -a Docker                 # macOS"
    exit 1
fi

echo "✅ Docker is running!"
echo ""

# Check if environment file exists
if [ ! -f .env.docker.local ]; then
    echo "❌ Missing .env.docker.local file"
    echo "   This file should have been created. Please check if it exists."
    exit 1
fi

echo "✅ Environment file found: .env.docker.local"

# Create storage directory if it doesn't exist
if [ ! -d "./storage" ]; then
    mkdir -p ./storage
    echo "✅ Created storage directory"
else
    echo "✅ Storage directory exists"
fi

echo ""
echo "🏗️  Building Docker image..."
echo "This may take several minutes on first build..."
echo ""

# Build the Docker image
if docker-compose build; then
    echo ""
    echo "✅ Docker build successful!"
    echo ""
    echo "🚀 Starting the application..."
    echo ""
    
    # Start the container
    if docker-compose up -d; then
        echo ""
        echo "🎉 Application is now running!"
        echo ""
        echo "📋 Quick Info:"
        echo "  🌐 Application URL: http://localhost:3000"
        echo "  🔧 Environment: Development (Docker)"
        echo "  🗃️  Storage: Local filesystem (./storage)"
        echo "  🔐 Authentication: Dev bypass enabled"
        echo ""
        echo "📊 Container Status:"
        docker-compose ps
        echo ""
        echo "📝 View logs: docker-compose logs -f"
        echo "🛑 Stop app:  docker-compose down"
        echo "🔄 Restart:   docker-compose restart"
        echo ""
        echo "✅ Docker setup complete!"
    else
        echo "❌ Failed to start container"
        echo ""
        echo "🔍 Check logs for errors:"
        echo "  docker-compose logs"
        exit 1
    fi
else
    echo "❌ Docker build failed"
    echo ""
    echo "🔍 Common solutions:"
    echo "  1. Make sure you have enough disk space"
    echo "  2. Try: docker system prune -f"
    echo "  3. Check if Docker Desktop has enough resources allocated"
    echo "  4. Review the error messages above"
    exit 1
fi