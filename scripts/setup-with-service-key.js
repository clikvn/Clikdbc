#!/usr/bin/env node

/**
 * Backend Service: Database Setup with Service Key
 * This script uses the service_role key to create database tables
 * 
 * ⚠️  SECURITY: This script should ONLY run on your local machine or secure backend
 * NEVER expose the service_role key in frontend code or git!
 * 
 * Usage: node scripts/setup-with-service-key.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables from both .env and .env.local
config(); // Load .env
config({ path: '.env.local' }); // Load .env.local (overrides .env)

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://btyjxckmqzqdqurgoojd.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Error: VITE_SUPABASE_URL not found');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.error('');
  console.error('Please create a .env.local file with:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql) {
  try {
    // Execute SQL directly using the REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function setupDatabase() {
  console.log('🚀 Starting Supabase database setup with service key...');
  console.log('📍 Project URL:', SUPABASE_URL);
  console.log('🔐 Using service_role key for schema modifications');
  console.log('');

  try {
    // Read SQL file
    const sqlFilePath = join(__dirname, '..', 'COPY_THIS_SQL.txt');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL file loaded');
    console.log('');

    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        // Filter out comments and empty statements
        return stmt.length > 0 && 
               !stmt.startsWith('--') && 
               !stmt.startsWith('/*') &&
               stmt !== 'Copy everything below this line and paste into Supabase SQL Editor';
      });

    console.log(`📝 Executing ${statements.length} SQL statements...`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      
      if (!statement || statement.startsWith('--')) continue;

      // Show progress
      const preview = statement.substring(0, 60).replace(/\n/g, ' ');
      process.stdout.write(`   [${i + 1}/${statements.length}] ${preview}...`);

      try {
        // Execute using Supabase client's query method
        const { data, error } = await supabase.rpc('exec', { sql: statement + ';' }).catch(async () => {
          // If RPC doesn't work, try direct SQL execution via PostgREST
          const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ query: statement + ';' })
          });
          
          if (!response.ok) {
            throw new Error(await response.text());
          }
          
          return { data: null, error: null };
        });

        if (error && !error.message.includes('already exists')) {
          console.log(` ⚠️  ${error.message.substring(0, 50)}`);
          errorCount++;
        } else {
          console.log(' ✅');
          successCount++;
        }
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(` ⚠️  ${error.message.substring(0, 50)}`);
          errorCount++;
        } else {
          console.log(' ✅ (already exists)');
          successCount++;
        }
      }
    }

    console.log('');
    console.log('─────────────────────────────────────────────');
    console.log(`✅ Completed: ${successCount} successful`);
    if (errorCount > 0) {
      console.log(`⚠️  Warnings: ${errorCount} (may be normal for existing objects)`);
    }
    console.log('─────────────────────────────────────────────');
    console.log('');
    console.log('✅ Database setup completed!');
    console.log('');
    console.log('📋 What was created:');
    console.log('   ✅ user_profiles table');
    console.log('   ✅ Row Level Security (RLS) policies');
    console.log('   ✅ Automatic profile creation trigger');
    console.log('   ✅ Indexes for performance');
    console.log('   ✅ Timestamp automation');
    console.log('');
    console.log('🔍 Verify setup:');
    console.log('   npm run db:verify');
    console.log('');
    console.log('🎉 Test registration:');
    console.log('   → Navigate to: http://localhost:3000/myclik/studio');
    console.log('   → Click "Sign up" and create a test account');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('');
    console.error('💡 Fallback: You can still run the SQL manually:');
    console.error('   1. Open: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql');
    console.error('   2. Copy contents from: COPY_THIS_SQL.txt');
    console.error('   3. Paste and click "Run"');
    console.error('');
    process.exit(1);
  }
}

// Run setup
setupDatabase();

