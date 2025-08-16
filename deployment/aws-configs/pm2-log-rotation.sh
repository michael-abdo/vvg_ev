#!/bin/bash

# PM2 Log Rotation Setup Script
# This script configures PM2 log rotation for production deployments

echo "=== PM2 Log Rotation Setup ==="

# Install pm2-logrotate module if not already installed
pm2 install pm2-logrotate

# Configure log rotation settings
echo "Configuring PM2 log rotation settings..."

# Set max file size to 10MB
pm2 set pm2-logrotate:max_size 10M

# Keep 30 rotated logs
pm2 set pm2-logrotate:retain 30

# Rotate logs daily
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD

# Enable compression for rotated logs
pm2 set pm2-logrotate:compress true

# Set rotation interval (daily)
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'

# Include PM2 logs
pm2 set pm2-logrotate:workerInterval 30

# Show current configuration
echo "Current PM2 log rotation configuration:"
pm2 conf pm2-logrotate

# Save PM2 configuration
pm2 save

echo "=== PM2 Log Rotation Setup Complete ==="
echo "Logs will be rotated daily with 10MB max size and 30 days retention"