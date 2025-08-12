-- Complete Database Schema Migration for VVG Template
-- Description: Creates all required tables for document processing template
-- Date: 2025-08-12
-- Author: VVG Template Team

-- Enable better MySQL support
SET foreign_key_checks = 0;

-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(500) NOT NULL,
  original_name VARCHAR(500) NOT NULL,
  file_hash VARCHAR(64) NOT NULL UNIQUE,
  s3_url VARCHAR(1000) NOT NULL,
  file_size BIGINT NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(255) NOT NULL,
  status ENUM('uploaded', 'processing', 'processed', 'error') DEFAULT 'uploaded',
  extracted_text LONGTEXT NULL,
  is_standard BOOLEAN DEFAULT FALSE,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_is_standard (is_standard),
  INDEX idx_file_hash (file_hash),
  INDEX idx_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- COMPARISONS TABLE  
-- =====================================================
CREATE TABLE IF NOT EXISTS comparisons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document1_id INT NOT NULL,
  document2_id INT NOT NULL,
  comparison_result_s3_url VARCHAR(1000) NULL,
  comparison_summary TEXT NULL,
  similarity_score DECIMAL(5,4) NULL,
  key_differences JSON NULL,
  ai_suggestions JSON NULL,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(255) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'error') DEFAULT 'pending',
  error_message TEXT NULL,
  processing_time_ms INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (document1_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (document2_id) REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_document1_id (document1_id),
  INDEX idx_document2_id (document2_id),
  INDEX idx_created_date (created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- EXPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS exports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comparison_id INT NOT NULL,
  export_type ENUM('pdf', 'docx') NOT NULL,
  export_s3_url VARCHAR(1000) NOT NULL,
  file_size BIGINT NOT NULL,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(255) NOT NULL,
  download_count INT DEFAULT 0,
  last_downloaded_at TIMESTAMP NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (comparison_id) REFERENCES comparisons(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_comparison_id (comparison_id),
  INDEX idx_export_type (export_type),
  INDEX idx_created_at (created_at),
  INDEX idx_created_date (created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PROCESSING QUEUE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS processing_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_id INT NOT NULL,
  task_type ENUM('extract_text', 'compare', 'export') NOT NULL,
  priority INT DEFAULT 5,
  status ENUM('queued', 'processing', 'completed', 'failed') DEFAULT 'queued',
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  scheduled_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  error_message TEXT NULL,
  result JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_document_id (document_id),
  INDEX idx_task_type (task_type),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET foreign_key_checks = 1;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Show created tables
SHOW TABLES;

-- Show table structures (for verification)
DESCRIBE documents;
DESCRIBE comparisons;
DESCRIBE exports;
DESCRIBE processing_queue;

-- Success message
SELECT 'Database migration completed successfully! All tables created.' as message;