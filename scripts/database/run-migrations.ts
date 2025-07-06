#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * Run this script when you have CREATE TABLE permissions to set up the database.
 * Usage: npm run db:migrate
 */

import { initializeDatabase } from '@/lib/nda/database';
import { executeQuery } from '@/lib/db';

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  
  try {
    // Check database connection
    console.log('📡 Testing database connection...');
    await executeQuery({ query: 'SELECT 1' });
    console.log('✅ Database connection successful\n');
    
    // Check if we have CREATE permissions
    console.log('🔐 Checking CREATE TABLE permissions...');
    try {
      await executeQuery({ 
        query: 'CREATE TABLE IF NOT EXISTS migration_test (id INT PRIMARY KEY)' 
      });
      await executeQuery({ query: 'DROP TABLE IF EXISTS migration_test' });
      console.log('✅ CREATE TABLE permissions confirmed\n');
    } catch (error: any) {
      console.error('❌ No CREATE TABLE permissions');
      console.error('Error:', error.message);
      console.error('\nPlease contact your database administrator for CREATE permissions.');
      process.exit(1);
    }
    
    // Run migrations
    console.log('📊 Creating NDA tables...');
    await initializeDatabase();
    console.log('✅ All tables created successfully\n');
    
    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const tables = ['nda_documents', 'nda_comparisons', 'nda_exports', 'nda_processing_queue'];
    
    for (const table of tables) {
      const result = await executeQuery({
        query: `SELECT COUNT(*) as count FROM information_schema.tables 
                WHERE table_schema = DATABASE() AND table_name = ?`,
        values: [table]
      });
      
      if ((result as any[])[0].count > 0) {
        console.log(`✅ Table ${table} exists`);
      } else {
        console.error(`❌ Table ${table} not found`);
      }
    }
    
    console.log('\n🎉 Database migration completed successfully!');
    console.log('You can now use the full database functionality.\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run migrations
runMigrations();