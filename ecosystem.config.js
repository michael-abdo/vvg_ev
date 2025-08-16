module.exports = {
  apps: [
    {
      // Production configuration
      name: 'vvg-template',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Logging configuration for production
        LOG_LEVEL: 'warn',
        LOG_DB_QUERIES: 'false',
        LOG_CHAT_DETAILS: 'false',
        LOG_API_STEPS: 'false',
        LOG_STARTUP: 'false'
      },
      // PM2 logging configuration
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      error_file: './logs/app-error.log',
      out_file: './logs/app-out.log',
      merge_logs: true,
      time: true,
      // Log rotation (handled by pm2-logrotate module)
      max_restarts: 10,
      min_uptime: '10s',
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      // Staging configuration
      name: 'vvg-template-staging',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        ENVIRONMENT: 'staging',
        PORT: 3001,
        // Logging configuration for staging (more verbose)
        LOG_LEVEL: 'info',
        LOG_DB_QUERIES: 'false',
        LOG_CHAT_DETAILS: 'false',
        LOG_API_STEPS: 'false',
        LOG_STARTUP: 'true'
      },
      // PM2 logging configuration
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      error_file: './logs/staging-error.log',
      out_file: './logs/staging-out.log',
      merge_logs: true,
      time: true,
      // Log rotation (handled by pm2-logrotate module)
      max_restarts: 10,
      min_uptime: '10s',
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      // Development configuration
      name: 'vvg-template-dev',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      exec_mode: 'fork',
      watch: ['src', 'public', '.env'],
      ignore_watch: ['node_modules', 'logs', '.next', '.git'],
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        // Logging configuration for development (most verbose)
        LOG_LEVEL: 'debug',
        LOG_DB_QUERIES: 'true',
        LOG_CHAT_DETAILS: 'true',
        LOG_API_STEPS: 'true',
        LOG_STARTUP: 'true'
      },
      // PM2 logging configuration
      log_type: 'raw',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/dev-error.log',
      out_file: './logs/dev-out.log',
      merge_logs: true,
      time: true
    }
  ],

  // Deploy configuration (optional)
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-production-server',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/vvg-template.git',
      path: '/home/ubuntu/vvg-template',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --only vvg-template',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production'
      }
    },
    staging: {
      user: 'ubuntu',
      host: 'your-staging-server',
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/vvg-template.git',
      path: '/home/ubuntu/vvg-template-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --only vvg-template-staging',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
        ENVIRONMENT: 'staging'
      }
    }
  }
};