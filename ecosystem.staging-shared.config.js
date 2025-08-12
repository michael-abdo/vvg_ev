/**
 * PM2 Ecosystem Configuration - Staging Environment (Shared Build)
 * 
 * This configuration runs staging with the same build as production
 * but on a different port (3001) for rapid development and testing.
 */

module.exports = {
  apps: [
    {
      name: 'vvg-template-staging',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      
      // Environment Configuration
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        ENVIRONMENT: 'staging',
        // Override basePath to match production build
        BASE_PATH: '/template',
        NEXT_PUBLIC_BASE_PATH: '/template',
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
      node_args: '--max-old-space-size=512',
      
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
        // Override to use production basePath
        BASE_PATH: '/template',
        NEXT_PUBLIC_BASE_PATH: '/template',
      }
    }
  ]
};