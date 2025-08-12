/**
 * PM2 Ecosystem Configuration - Staging Environment
 * 
 * Environment Loading Order:
 * 1. NODE_ENV=staging → Next.js loads .env.staging
 * 2. next.config.mjs → BASE_PATH resolution
 * 3. lib/config.ts → comprehensive validation
 */

module.exports = {
  apps: [
    {
      name: 'vvg-template-staging',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname.replace('/config/ecosystem', '/worktrees/staging'),
      instances: 1,
      exec_mode: 'fork',
      
      // Environment Configuration
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        ENVIRONMENT: 'staging',
      },
      
      // Environment file loading
      env_file: '.env.staging',
      
      // PM2 Logging Configuration
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      out_file: './logs/staging-out.log',
      error_file: './logs/staging-error.log',
      
      // Log Rotation
      rotate_logs: true,
      max_log_file_size: '10M',
      retain_logs: 30,
      
      // Process Management
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next'],
      
      // Memory and CPU
      max_memory_restart: '500M',
      
      // Health Monitoring
      min_uptime: '10s',
      max_restarts: 5,
      
      // Graceful Shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      
      // Additional Environment Variables
      env_staging: {
        NODE_ENV: 'production',
        PORT: 3001,
        ENVIRONMENT: 'staging',
        // These will be loaded from .env.staging
        BASE_PATH: '/template-staging',
        NEXT_PUBLIC_BASE_PATH: '/template-staging',
      }
    }
  ],
  
  deploy: {
    staging: {
      user: 'deploy',
      host: 'your-staging-server.com',
      ref: 'origin/staging',
      repo: 'https://github.com/your-username/vvg-template.git',
      path: '/var/www/vvg-template-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.staging.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};