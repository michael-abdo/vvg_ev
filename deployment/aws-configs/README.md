# AWS Deployment Configurations

This directory contains configuration scripts for AWS EC2 deployment, including PM2 log rotation and SSM cleanup utilities.

## Files Overview

### 1. `pm2-log-rotation.sh`
Configures PM2 log rotation to prevent disk space issues in production.

**Features:**
- Rotates logs daily
- 10MB maximum file size per log
- Keeps 30 days of historical logs
- Compresses rotated logs to save space

### 2. `ssm-cleanup-cron.sh`
Cleans up orphaned AWS SSM (Session Manager) processes that can cause memory leaks.

**Features:**
- Kills SSM session worker processes older than 24 hours
- Cleans up orphaned socket files
- Logs all cleanup operations
- Auto-rotates its own log file when >10MB

### 3. `setup-cron.sh`
Installs the SSM cleanup script as a cron job.

**Features:**
- Runs SSM cleanup every 6 hours
- Creates necessary log files with proper permissions
- Checks for existing cron jobs to prevent duplicates

## Deployment Instructions

### 1. Upload Files to EC2

```bash
# From your local machine
scp -r deployment/aws-configs ubuntu@your-ec2-instance:~/deployment/
```

### 2. SSH into EC2 Instance

```bash
ssh ubuntu@your-ec2-instance
```

### 3. Make Scripts Executable

```bash
cd ~/deployment/aws-configs
chmod +x *.sh
```

### 4. Setup PM2 Log Rotation

```bash
# Run once after PM2 is installed
./pm2-log-rotation.sh
```

### 5. Setup SSM Cleanup Cron Job

```bash
# Run once to install the cron job
./setup-cron.sh
```

### 6. Verify Installation

```bash
# Check PM2 log rotation config
pm2 conf pm2-logrotate

# Check cron jobs
crontab -l

# Test SSM cleanup manually
./ssm-cleanup-cron.sh

# Check cleanup log
tail -f /var/log/ssm-cleanup.log
```

## Maintenance

### PM2 Log Rotation
- Logs are automatically rotated daily
- Old logs are compressed and stored in: `~/.pm2/logs/`
- No manual intervention required

### SSM Cleanup
- Runs automatically every 6 hours via cron
- Check `/var/log/ssm-cleanup.log` for cleanup history
- Manual run: `./ssm-cleanup-cron.sh`

### Monitoring

```bash
# Check disk space
df -h

# Check PM2 logs directory size
du -sh ~/.pm2/logs/

# Monitor SSM cleanup activity
tail -f /var/log/ssm-cleanup.log

# List current SSM processes
pgrep -f "ssm-session-worker" | wc -l
```

## Troubleshooting

### PM2 Log Rotation Not Working
```bash
# Reinstall pm2-logrotate
pm2 uninstall pm2-logrotate
pm2 install pm2-logrotate
./pm2-log-rotation.sh
```

### SSM Cleanup Not Running
```bash
# Check cron service
systemctl status cron

# Check cron logs
grep CRON /var/log/syslog | tail -20

# Manually test the script
bash -x ./ssm-cleanup-cron.sh
```

### High Memory Usage from SSM
```bash
# Immediate cleanup
sudo pkill -f "ssm-session-worker"

# Check memory usage
free -h
ps aux | grep ssm | head -20
```

## Security Notes

1. **File Permissions**: Scripts should be owned by the deployment user (ubuntu)
2. **Log Files**: SSM cleanup logs may contain process IDs, ensure proper permissions
3. **Cron Jobs**: Run as the deployment user, not root

## Integration with VVG Template

These configurations are designed to work with the VVG Template deployment:

1. **PM2 Process**: The template runs under PM2 for process management
2. **Log Locations**: Application logs in `logs/` directory, PM2 logs in `~/.pm2/logs/`
3. **SSM Access**: Used for secure shell access without SSH keys

## Best Practices

1. **Regular Monitoring**: Check logs weekly for any issues
2. **Disk Space**: Monitor available disk space monthly
3. **Updates**: Keep PM2 and modules updated
4. **Backups**: Backup important logs before major deployments

## Support

For issues or questions:
1. Check the application logs: `pm2 logs vvg-template`
2. Review SSM cleanup logs: `/var/log/ssm-cleanup.log`
3. Verify cron is running: `systemctl status cron`