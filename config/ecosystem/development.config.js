/**
 * PM2 Development Configuration
 * Following 2024 industry standards for environment variable inheritance
 * 
 * This configuration ensures .env files are the single source of truth
 * PM2 will load environment variables from .env file
 */

module.exports = {
  apps: [{
    name: 'vvg-template-dev',
    script: 'npm',
    args: 'run dev',
    
    // Load .env file using Node.js native support
    node_args: '-r dotenv/config',
    
    // Specify the .env file to use (defaults to .env)
    env_file: '.env',
    
    // Process management
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: ['src', 'public', '.env'],
    ignore_watch: ['node_modules', 'logs', '.next', '.git'],
    max_memory_restart: '1G',
    
    // Logging configuration
    error_file: 'logs/dev-error.log',
    out_file: 'logs/dev-out.log',
    log_type: 'json',
    log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
    merge_logs: true,
    
    // Log rotation
    log_max_size: '10M',
    log_file_num: 3,
    
    // Only set NODE_ENV, let everything else come from .env
    env: {
      NODE_ENV: 'development'
    }
  }]
};