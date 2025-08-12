/**
 * PM2 Ecosystem Configuration - Staging Environment (Isolated)
 * 
 * Runs from dedicated environments/staging directory with staging build
 */

module.exports = {
  apps: [
    {
      name: 'vvg-template-staging',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname + '/environments/staging',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment Configuration
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        ENVIRONMENT: 'staging',
        BASE_PATH: '/template-staging',
        NEXT_PUBLIC_BASE_PATH: '/template-staging',
      },
      
      // Environment file loading
      env_file: '.env.staging',
      
      // PM2 Logging Configuration
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      out_file: '../../logs/staging-isolated-out.log',
      error_file: '../../logs/staging-isolated-error.log',
      
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
    }
  ]
};