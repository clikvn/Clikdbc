#!/usr/bin/env node

/**
 * Direct SQL Execution via Supabase REST API
 * Uses service_role key to execute SQL statements
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ Missing service key. Run: npm run db:setup-backend');
  process.exit(1);
}

console.log('🚀 Executing SQL with service key...');
console.log('📍 Project URL:', SUPABASE_URL);
console.log('');

// Read and prepare SQL
const sqlFile = join(__dirname, '..', 'COPY_THIS_SQL.txt');
const fullSQL = readFileSync(sqlFile, 'utf8');

// Clean up SQL - remove comments and combine into statements
const cleanSQL = fullSQL
  .split('\n')
  .filter(line => !line.trim().startsWith('--') && line.trim() !== 'Copy everything below this line and paste into Supabase SQL Editor')
  .join('\n')
  .trim();

console.log('📝 SQL loaded and cleaned');
console.log('📊 Total length:', cleanSQL.length, 'characters');
console.log('');

// Execute via Supabase REST API
async function executeSQLBatch() {
  try {
    console.log('🔄 Executing SQL batch...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        sql: cleanSQL
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('⚠️  REST API response:', response.status);
      console.log('');
      
      // This is expected - Supabase doesn't expose arbitrary SQL execution via REST API
      // Even with service_role key, for security reasons
      console.log('❌ Cannot execute SQL via REST API');
      console.log('');
      console.log('🔒 This is a Supabase security feature:');
      console.log('   Even the service_role key cannot execute arbitrary DDL via REST API');
      console.log('');
      console.log('✅ SOLUTION: Use Supabase SQL Editor');
      console.log('   This is the intended and secure way to create tables');
      console.log('');
      console.log('📝 Steps (60 seconds):');
      console.log('   1. Open: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql');
      console.log('   2. Click "New Query"');
      console.log('   3. Copy contents from: COPY_THIS_SQL.txt');
      console.log('   4. Paste and click "Run"');
      console.log('   5. Verify: npm run db:verify');
      console.log('');
      return false;
    }

    const data = await response.json();
    console.log('✅ SQL executed successfully!');
    console.log('');
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

executeSQLBatch().then(success => {
  if (!success) {
    console.log('💡 Alternative: Supabase CLI');
    console.log('   1. Install: npm install -g supabase');
    console.log('   2. Login: supabase login');
    console.log('   3. Link: supabase link --project-ref btyjxckmqzqdqurgoojd');
    console.log('   4. Run SQL: supabase db execute --file COPY_THIS_SQL.txt');
    console.log('');
  }
  process.exit(success ? 0 : 1);
});

