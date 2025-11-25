#!/usr/bin/env node

/**
 * Verify Supabase Database Setup
 * This script checks if the database is properly configured
 * 
 * Usage: node scripts/verify-database.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyDatabase() {
  console.log('🔍 Verifying Supabase database setup...');
  console.log('📍 Project URL:', SUPABASE_URL);
  console.log('');

  let allChecks = true;

  try {
    // Check 1: Test connection
    console.log('1️⃣ Testing Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(0);

    if (healthError && healthError.message.includes('relation "public.user_profiles" does not exist')) {
      console.error('   ❌ user_profiles table does not exist');
      console.log('   💡 Run: node scripts/setup-database.js');
      allChecks = false;
    } else if (healthError) {
      console.warn('   ⚠️  Connection issue:', healthError.message);
      allChecks = false;
    } else {
      console.log('   ✅ Connection successful');
    }

    // Check 2: Test authentication
    console.log('');
    console.log('2️⃣ Testing authentication service...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('   ⚠️  Auth issue:', sessionError.message);
    } else {
      console.log('   ✅ Authentication service ready');
    }

    // Check 3: Summary
    console.log('');
    console.log('📊 Verification Summary:');
    if (allChecks) {
      console.log('   ✅ Database is properly configured');
      console.log('   ✅ Ready for user registration');
      console.log('');
      console.log('🎉 Next steps:');
      console.log('   1. Start dev server: npm run dev');
      console.log('   2. Navigate to: http://localhost:3000/myclik/studio');
      console.log('   3. Click "Sign up" to register a test user');
    } else {
      console.log('   ❌ Database setup incomplete');
      console.log('');
      console.log('💡 To fix:');
      console.log('   1. Run: node scripts/setup-database.js');
      console.log('   2. Or manually execute: supabase-setup.sql in Supabase SQL Editor');
      console.log('      https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    allChecks = false;
  }

  console.log('');
  process.exit(allChecks ? 0 : 1);
}

// Run verification
verifyDatabase();

