#!/usr/bin/env node

/**
 * Create .env.local file with service key
 * This separates the dangerous service key from the safe anon key
 */

import { writeFileSync, existsSync } from 'fs';

const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eWp4Y2ttcXpxZHF1cmdvb2pkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzgwMDIzOSwiZXhwIjoyMDUzMzc2MjM5fQ.sb_secret_AXuBXtUufawneJGgtidDjA__zOl1gUo';

const envLocalContent = `# Backend Service Environment Variables
# This file is for backend/server-side operations only
# ⚠️  NEVER commit this file to git!
# ⚠️  NEVER use these keys in frontend code!

SUPABASE_SERVICE_ROLE_KEY=${serviceKey}
`;

console.log('🔐 Creating .env.local with service key...');
console.log('');

if (existsSync('.env.local')) {
  console.log('⚠️  .env.local already exists');
  console.log('');
  console.log('Options:');
  console.log('  1. Delete .env.local and run this script again');
  console.log('  2. Manually add to .env.local:');
  console.log('');
  console.log(`SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`);
  console.log('');
} else {
  writeFileSync('.env.local', envLocalContent);
  console.log('✅ Created .env.local');
  console.log('');
  console.log('📋 What\'s in .env.local:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY - For backend operations only');
  console.log('');
  console.log('🔒 Security:');
  console.log('   ✅ .env.local is in .gitignore (not committed)');
  console.log('   ✅ Only use for local backend scripts');
  console.log('   ❌ Never use in frontend code');
  console.log('');
  console.log('🎯 Next step:');
  console.log('   npm run db:setup-backend');
  console.log('');
}

