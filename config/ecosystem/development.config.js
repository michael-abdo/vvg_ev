// PM2 Ecosystem Configuration for VVG Template
// Comprehensive logging and monitoring configuration for complete transparency
// Usage: pm2 start ecosystem.config.js --env staging|production

const path = require('path');

// Ensure logs directory exists
const logsDir = './logs';
require('fs').mkdirSync(logsDir, { recursive: true });

module.exports = {
  apps: [
    {
      name: 'vvg-template-staging',
      script: './node_modules/.bin/next',
      args: 'start',
      cwd: process.env.APP_DIR || '/home/ubuntu/vvg-template',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // Environment Configuration
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT,
        ENVIRONMENT: 'staging',
        // Comprehensive logging flags
        DEBUG: 'app:*,auth:*,db:*,api:*',
        LOG_LEVEL: 'debug',
        PM2_LOG_DETAILED: 'true',
        STARTUP_LOGGING: 'true'
      },
      env_staging: {
        NODE_ENV: 'production',
        PORT: process.env.PORT,
        ENVIRONMENT: 'staging',
        DEBUG: 'app:*,auth:*,db:*,api:*',
        LOG_LEVEL: 'debug',
        PM2_LOG_DETAILED: 'true',
        STARTUP_LOGGING: 'true'
      },
      
      // Comprehensive Logging Configuration
      log_type: 'json',
      out_file: './logs/staging-out.log',
      error_file: './logs/staging-error.log',
      log_file: './logs/staging-combined.log',
      pid_file: './logs/staging.pid',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      
      // Advanced Logging Options
      merge_logs: true,
      combine_logs: true,
      rotate_logs: true,
      max_log_file_size: '10M',
      retain_logs: 30, // Keep 30 days of logs
      
      // Health Monitoring & Transparency
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 1000,
      exp_backoff_restart_delay: 100,
      
      // Process Management
      listen_timeout: 8000,
      kill_timeout: 5000,
      wait_ready: true,
      
      // Monitoring & Metrics
      pmx: true,
      automation: false,
      
      // Custom startup script with logging
      node_args: '--max-old-space-size=1024',
      
      // Health check endpoint
      health_check_grace_period: 3000
    },
    
    {
      name: 'vvg-template-production',
      script: './node_modules/.bin/next',
      args: 'start',
      cwd: process.env.APP_DIR || '/home/ubuntu/vvg-template',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // Environment Configuration
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT,
        ENVIRONMENT: 'production',
        // Production logging (less verbose but comprehensive)
        DEBUG: 'app:error,auth:*,db:error,api:error',
        LOG_LEVEL: 'info',
        PM2_LOG_DETAILED: 'true',
        STARTUP_LOGGING: 'true'
      },
      
      // Comprehensive Logging Configuration  
      log_type: 'json',
      out_file: './logs/production-out.log',
      error_file: './logs/production-error.log',
      log_file: './logs/production-combined.log',
      pid_file: './logs/production.pid',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      
      // Advanced Logging Options
      merge_logs: true,
      combine_logs: true,
      rotate_logs: true,
      max_log_file_size: '25M',
      retain_logs: 60, // Keep 60 days of logs in production
      
      // Health Monitoring & Transparency
      min_uptime: '30s',
      max_restarts: 3,
      restart_delay: 2000,
      exp_backoff_restart_delay: 200,
      
      // Process Management
      listen_timeout: 8000,
      kill_timeout: 5000,
      wait_ready: true,
      
      // Monitoring & Metrics
      pmx: true,
      automation: false,
      
      // Production optimizations
      node_args: '--max-old-space-size=2048',
      
      // Health check endpoint
      health_check_grace_period: 5000
    }
  ],
  
  // Global PM2 Configuration
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-production-server',
      ref: 'origin/main',
      repo: 'https://github.com/your-org/vvg-template.git',
      path: process.env.APP_DIR || '/home/ubuntu/vvg-template',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};