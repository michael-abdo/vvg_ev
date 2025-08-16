#!/bin/bash

# Setup Cron Jobs for AWS Deployment
# This script installs the SSM cleanup cron job

echo "=== Setting up Cron Jobs ==="

# Make SSM cleanup script executable
chmod +x /home/ubuntu/deployment/aws-configs/ssm-cleanup-cron.sh

# Create cron job for SSM cleanup (runs every 6 hours)
CRON_JOB="0 */6 * * * /home/ubuntu/deployment/aws-configs/ssm-cleanup-cron.sh"

# Check if cron job already exists
if ! crontab -l 2>/dev/null | grep -q "ssm-cleanup-cron.sh"; then
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "Added SSM cleanup cron job (runs every 6 hours)"
else
    echo "SSM cleanup cron job already exists"
fi

# Create log directory if it doesn't exist
sudo mkdir -p /var/log
sudo touch /var/log/ssm-cleanup.log
sudo chown ubuntu:ubuntu /var/log/ssm-cleanup.log

# Display current crontab
echo ""
echo "Current crontab entries:"
crontab -l

echo ""
echo "=== Cron Setup Complete ==="
echo "SSM cleanup will run every 6 hours to prevent memory leaks"