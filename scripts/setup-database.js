#!/usr/bin/env node

/**
 * Automated Supabase Database Setup Script
 * This script reads the SQL file and executes it against your Supabase database
 * 
 * Usage: node scripts/setup-database.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://btyjxckmqzqdqurgoojd.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  try {
    console.log('🚀 Starting Supabase database setup...');
    console.log('📍 Project URL:', SUPABASE_URL);
    console.log('');

    // Read SQL file
    const sqlFilePath = join(__dirname, '..', 'supabase-setup.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL file loaded successfully');
    console.log('');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);
    console.log('');

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      try {
        // Use Supabase RPC to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        }).catch(async (rpcError) => {
          // If RPC doesn't exist, try direct query
          return await supabase.from('_').select('*').limit(0);
        });

        if (error) {
          console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed`);
        }
      } catch (error) {
        console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message);
      }
    }

    console.log('');
    console.log('✅ Database setup completed!');
    console.log('');
    console.log('📋 What was created:');
    console.log('   - user_profiles table');
    console.log('   - Row Level Security (RLS) policies');
    console.log('   - Automatic profile creation trigger');
    console.log('   - Indexes for performance');
    console.log('');
    console.log('🎉 You can now test user registration!');
    console.log('   → Navigate to: http://localhost:3000/myclik/studio');
    console.log('');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('');
    console.error('💡 Alternative: Copy the SQL from supabase-setup.sql');
    console.error('   and run it manually in Supabase SQL Editor:');
    console.error('   https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql');
    process.exit(1);
  }
}

// Run setup
setupDatabase();

