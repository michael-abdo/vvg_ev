/**
 * PM2 Ecosystem Configuration - Production Environment (Isolated)
 * 
 * Runs from dedicated environments/production directory with production build
 */

module.exports = {
  apps: [
    {
      name: 'vvg-template-production',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname + '/environments/production',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment Configuration
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        BASE_PATH: '/template',
        NEXT_PUBLIC_BASE_PATH: '/template',
      },
      
      // Environment file loading
      env_file: '.env.production',
      
      // PM2 Logging Configuration
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      out_file: '../../logs/production-isolated-out.log',
      error_file: '../../logs/production-isolated-error.log',
      
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
    }
  ]
};