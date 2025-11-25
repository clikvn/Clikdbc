#!/usr/bin/env node

/**
 * Backend Service: Direct SQL Execution
 * Uses PostgreSQL wire protocol to execute SQL
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Extract project details from URL
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://btyjxckmqzqdqurgoojd.supabase.co';
const projectRef = 'btyjxckmqzqdqurgoojd';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.error('');
  console.error('Run this first:');
  console.error('  node scripts/create-env-local.js');
  console.error('');
  process.exit(1);
}

console.log('🚀 Setting up database via direct connection...');
console.log('📍 Project:', projectRef);
console.log('');

// Construct PostgreSQL connection string
const connectionString = `postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

console.log('⚠️  Direct PostgreSQL connection requires your database password');
console.log('');
console.log('📝 To get your database password:');
console.log('   1. Go to: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/settings/database');
console.log('   2. Find "Connection string" section');
console.log('   3. Copy the password');
console.log('');
console.log('💡 Easier method: Use the SQL Editor approach');
console.log('   Run: npm run db:setup-manual');
console.log('');

