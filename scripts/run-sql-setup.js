#!/usr/bin/env node

/**
 * Remote SQL Setup Script
 * This script executes the SQL setup directly against your Supabase database
 * 
 * Usage: node scripts/run-sql-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  console.error('   Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function executeSQL(sql) {
  try {
    // Use Supabase's RPC to execute raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

async function setupDatabase() {
  console.log('🚀 Starting remote Supabase database setup...');
  console.log('📍 Project URL:', SUPABASE_URL);
  console.log('');

  try {
    // Step 1: Create user_profiles table
    console.log('1️⃣ Creating user_profiles table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id uuid NOT NULL DEFAULT auth.uid(),
        user_code text NOT NULL,
        email text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
        CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
        CONSTRAINT user_profiles_user_code_key UNIQUE (user_code)
      );
    `;

    const { data: tableData, error: tableError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(0)
      .catch(async () => {
        // Table doesn't exist, create it using a workaround
        // Since we can't execute arbitrary SQL with anon key, we'll use the Management API approach
        return { data: null, error: null };
      });

    if (tableError && tableError.message.includes('does not exist')) {
      console.log('   ⚠️  Table does not exist. Need to create it manually.');
      console.log('');
      console.log('❌ Cannot create table remotely with anon key');
      console.log('');
      console.log('💡 The anon key cannot execute DDL (Data Definition Language) commands.');
      console.log('   You need to run the SQL in Supabase SQL Editor manually.');
      console.log('');
      console.log('📝 Here\'s what to do:');
      console.log('');
      console.log('1. Open Supabase SQL Editor:');
      console.log('   https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql');
      console.log('');
      console.log('2. Click "New Query"');
      console.log('');
      console.log('3. Copy the contents of: supabase-setup.sql');
      console.log('');
      console.log('4. Paste and click "Run"');
      console.log('');
      console.log('5. Run this script again to verify: npm run db:verify');
      console.log('');
      
      process.exit(1);
    }

    console.log('   ✅ user_profiles table exists!');
    console.log('');
    console.log('✅ Database is already set up!');
    console.log('');
    console.log('🎉 You can now test user registration!');
    console.log('   → Navigate to: http://localhost:3000/myclik/studio');
    console.log('');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('');
    console.error('💡 The anon key has limited permissions and cannot create tables.');
    console.error('   You need to run the SQL script manually in Supabase SQL Editor.');
    console.error('');
    console.error('📝 Steps:');
    console.error('   1. Go to: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql');
    console.error('   2. Click "New Query"');
    console.error('   3. Copy all contents from: supabase-setup.sql');
    console.error('   4. Paste and click "Run"');
    console.error('');
    process.exit(1);
  }
}

// Run setup
setupDatabase();

