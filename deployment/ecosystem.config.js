// PM2 Ecosystem Configuration for NDA Analyzer
// Based on Jack's deployment video specifications
// Place this file in the application root directory

module.exports = {
  apps: [
    {
      name: 'nda-analyzer',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/nda-analyzer',
      
      // Environment configuration
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        
        // Production environment file will be loaded
        // Make sure .env.production exists in the root directory
      },
      
      // Process management
      instances: 1, // Single instance for MVP, can scale to 'max' later
      exec_mode: 'fork', // Use 'cluster' when scaling to multiple instances
      
      // Auto-restart configuration
      autorestart: true,
      watch: false, // Disable watch in production
      max_memory_restart: '1G',
      restart_delay: 4000,
      
      // Restart strategies
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging configuration
      log_file: '/home/ubuntu/logs/nda-analyzer/combined.log',
      out_file: '/home/ubuntu/logs/nda-analyzer/out.log',
      error_file: '/home/ubuntu/logs/nda-analyzer/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Health monitoring
      health_check_grace_period: 3000,
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Environment variables specific to production
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        LOG_LEVEL: 'info',
        
        // These will be overridden by .env.production file
        NEXTAUTH_URL: 'https://legal.vtc.systems/nda-analyzer',
        SECURE_COOKIES: 'true',
        TRUST_PROXY: 'true'
      }
    }
  ],
  
  // Deployment configuration (optional - for PM2 deploy feature)
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'legal.vtc.systems',
      ref: 'origin/main',
      repo: 'git@github.com:michael-abdo/vvg_nda.git', // Updated with actual repo URL
      path: '/home/ubuntu/nda-analyzer',
      
      // Pre-deployment commands
      'pre-setup': 'sudo apt update && sudo apt install -y git nodejs npm',
      
      // Post-deployment commands
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
      
      // Environment variables for deployment
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};

// Usage Instructions:
// 
// 1. Copy this file to the application root directory
// 2. Ensure .env.production exists with all required environment variables
// 3. Create log directories:
//    sudo mkdir -p /home/ubuntu/logs/nda-analyzer
//    sudo chown ubuntu:ubuntu /home/ubuntu/logs/nda-analyzer
// 
// 4. Start the application:
//    pm2 start ecosystem.config.js --env production
// 
// 5. Save PM2 configuration and enable startup:
//    pm2 save
//    pm2 startup
//    (Follow the generated command to enable auto-start on boot)
// 
// 6. Monitor the application:
//    pm2 status
//    pm2 logs nda-analyzer
//    pm2 monit
// 
// 7. Restart application:
//    pm2 restart nda-analyzer
// 
// 8. Stop application:
//    pm2 stop nda-analyzer
// 
// 9. Delete application from PM2:
//    pm2 delete nda-analyzer