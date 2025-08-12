/**
 * PM2 Ecosystem Configuration - Production Environment
 * 
 * Environment Loading Order:
 * 1. NODE_ENV=production → Next.js loads .env.production
 * 2. next.config.mjs → BASE_PATH resolution
 * 3. lib/config.ts → comprehensive validation
 */

module.exports = {
  apps: [
    {
      name: 'vvg-template-production',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      
      // Environment Configuration
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Environment file loading
      env_file: '.env.production',
      
      // PM2 Logging Configuration
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      out_file: './logs/production-out.log',
      error_file: './logs/production-error.log',
      
      // Log Rotation
      rotate_logs: true,
      max_log_file_size: '10M',
      retain_logs: 30,
      
      // Process Management
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next'],
      
      // Memory and CPU (Production scaling)
      max_memory_restart: '1G',
      
      // Health Monitoring
      min_uptime: '10s',
      max_restarts: 10,
      
      // Graceful Shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      
      // Additional Environment Variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        // These will be loaded from .env.production
        BASE_PATH: '/template',
        NEXT_PUBLIC_BASE_PATH: '/template',
      }
    }
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/vvg-template.git',
      path: '/var/www/vvg-template-production',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.production.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};