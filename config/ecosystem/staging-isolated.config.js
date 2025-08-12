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
        NEXTAUTH_URL: 'http://localhost:3001/template-staging',
        NEXTAUTH_SECRET: 'your-secure-staging-nextauth-secret',
        AZURE_AD_CLIENT_ID: 'f5b4d309-f081-42b4-8735-0e721dbaaf12',
        AZURE_AD_CLIENT_SECRET: '1cQ8Q~hf0LKV-TLtjtvmfVMsOv_Kn_ARZ_CoBbTr',
        AZURE_AD_TENANT_ID: '1a58d276-b83f-4385-b9d2-0417f6191864',
        DATABASE_URL: 'mysql://michael:Ei#qs9T!px@Wso@vtcawsinnovationmysql01-cluster.cluster-c1hfshlb6czo.us-west-2.rds.amazonaws.com:3306/vvg_template',
        MYSQL_HOST: 'vtcawsinnovationmysql01-cluster.cluster-c1hfshlb6czo.us-west-2.rds.amazonaws.com',
        MYSQL_PORT: '3306',
        MYSQL_DATABASE: 'vvg_template',
        MYSQL_USER: 'michael',
        MYSQL_PASSWORD: 'Ei#qs9T!px@Wso',
        STORAGE_PROVIDER: 's3',
        S3_BUCKET_NAME: 'vvg-template-shared-bucket',
        S3_FOLDER_PREFIX: 'template-staging/',
        AWS_REGION: 'us-west-2',
        AWS_ACCESS_KEY_ID: 'AKIA6BJV4MLE2LONIVHX',
        AWS_SECRET_ACCESS_KEY: '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',
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