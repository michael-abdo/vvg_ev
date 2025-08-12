#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * Run this script when you have CREATE TABLE permissions to set up the database.
 * Usage: npm run db:migrate
 */

import { executeQuery } from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    console.log('📊 Creating database tables...');
    
    // Read and execute migration file
    const migrationPath = join(process.cwd(), 'database', 'migrations', '001_create_tables.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Split SQL by statements and execute each one
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.toLowerCase().includes('create table')) {
        const tableName = statement.match(/create table\s+(?:if not exists\s+)?(\w+)/i)?.[1];
        console.log(`🔨 Creating table: ${tableName}`);
      }
      
      try {
        await executeQuery({ query: statement });
        
        // Show progress for major operations
        if (statement.toLowerCase().includes('create table')) {
          console.log(`✅ Table created successfully`);
        }
      } catch (error: any) {
        // Ignore harmless errors
        if (error.message.includes('already exists') || 
            error.message.includes('SHOW TABLES') ||
            error.message.includes('DESCRIBE')) {
          continue;
        }
        throw error;
      }
    }
    
    console.log('\n✅ All migration statements executed successfully\n');
    
    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const tables = ['documents', 'comparisons', 'exports', 'processing_queue'];
    
    for (const table of tables) {
      const result = await executeQuery({
        query: `SELECT COUNT(*) as count FROM information_schema.tables 
                WHERE table_schema = DATABASE() AND table_name = ?`,
        values: [table]
      });
      
      if ((result as any[])[0].count > 0) {
        console.log(`✅ Table ${table} exists and ready`);
      } else {
        console.error(`❌ Table ${table} not found`);
      }
    }
    
    // Show final table summary
    console.log('\n📊 Database Summary:');
    const tableResult = await executeQuery({ query: 'SHOW TABLES' });
    console.log(`📝 Total tables: ${(tableResult as any[]).length}`);
    
    console.log('\n🎉 Database migration completed successfully!');
    console.log('✨ Your MySQL database is now ready for the application.\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run migrations
runMigrations();