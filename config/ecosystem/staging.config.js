/**
 * PM2 Staging Configuration
 * Following 2024 industry standards for environment variable inheritance
 * 
 * This configuration ensures .env files are the single source of truth
 * PM2 will load environment variables from .env.staging file
 */

module.exports = {
  apps: [{
    name: 'vvg-template-staging',
    script: './server-staging.js',
    cwd: './worktrees/staging',
    
    // Environment is loaded by server-staging.js
    env: {
      NODE_ENV: 'staging'
    },
    
    // Process management
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Logging configuration
    error_file: 'logs/staging-error.log',
    out_file: 'logs/staging-out.log',
    log_type: 'json',
    log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
    merge_logs: true,
    
    // Log rotation
    log_max_size: '10M',
    log_file_num: 5,
    
    // Only set NODE_ENV, let everything else come from .env.staging
    env: {
      NODE_ENV: 'staging'
    }
  }]
};