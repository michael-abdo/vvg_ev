// PM2 Configuration for Docker Container
module.exports = {
  apps: [{
    name: 'vvg-template',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Docker-specific log paths
    error_file: '/app/logs/app-error.log',
    out_file: '/app/logs/app-out.log',
    log_type: 'json',
    log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
    merge_logs: true,
    time: true,
    
    // Memory and restart configuration
    max_memory_restart: '1G',
    watch: false,
    autorestart: true,
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    wait_ready: true,
    shutdown_with_message: true,
    
    // Health check endpoint
    health: {
      port: 3000,
      path: '/api/health',
      interval: 30
    }
  }]
};