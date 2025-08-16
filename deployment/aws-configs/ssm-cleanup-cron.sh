#!/bin/bash

# SSM Session Manager Cleanup Script
# Cleans up orphaned SSM session processes to prevent memory leaks

# Log file for cleanup operations
LOG_FILE="/var/log/ssm-cleanup.log"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Start cleanup
log_message "Starting SSM session cleanup"

# Find and kill orphaned ssm-session-worker processes older than 24 hours
KILLED_COUNT=0
while IFS= read -r pid; do
    if [ -n "$pid" ]; then
        # Get process creation time
        PROCESS_START=$(ps -o lstart= -p "$pid" 2>/dev/null | xargs -I {} date -d "{}" +%s 2>/dev/null)
        CURRENT_TIME=$(date +%s)
        
        if [ -n "$PROCESS_START" ]; then
            AGE_HOURS=$(( (CURRENT_TIME - PROCESS_START) / 3600 ))
            
            # Kill if older than 24 hours
            if [ "$AGE_HOURS" -gt 24 ]; then
                if kill -TERM "$pid" 2>/dev/null; then
                    log_message "Killed orphaned ssm-session-worker PID: $pid (age: ${AGE_HOURS}h)"
                    KILLED_COUNT=$((KILLED_COUNT + 1))
                fi
            fi
        fi
    fi
done < <(pgrep -f "ssm-session-worker")

# Clean up orphaned SSM agent sockets
SOCKET_DIR="/var/lib/amazon/ssm/session"
if [ -d "$SOCKET_DIR" ]; then
    # Remove socket files older than 24 hours
    find "$SOCKET_DIR" -name "*.sock" -type s -mtime +1 -delete 2>/dev/null
    CLEANED_SOCKETS=$?
    if [ "$CLEANED_SOCKETS" -eq 0 ]; then
        log_message "Cleaned up old SSM socket files"
    fi
fi

# Report cleanup summary
if [ "$KILLED_COUNT" -gt 0 ]; then
    log_message "Cleanup complete: Killed $KILLED_COUNT orphaned processes"
else
    log_message "Cleanup complete: No orphaned processes found"
fi

# Rotate log file if it's too large (>10MB)
if [ -f "$LOG_FILE" ]; then
    LOG_SIZE=$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)
    if [ "$LOG_SIZE" -gt 10485760 ]; then
        mv "$LOG_FILE" "${LOG_FILE}.old"
        log_message "Log file rotated"
    fi
fi