module.exports = {
  apps: [{
    name: 'nda-analyzer',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Restart on failure
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};