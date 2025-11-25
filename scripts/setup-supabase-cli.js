#!/usr/bin/env node

/**
 * Supabase CLI Setup Helper
 * Guides user through CLI installation and project linking
 */

import { execSync } from 'child_process';

console.log('🚀 Supabase CLI Setup Helper');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Check if CLI is installed
console.log('1️⃣ Checking Supabase CLI installation...');
try {
  const version = execSync('supabase --version', { encoding: 'utf-8' }).trim();
  console.log(`   ✅ CLI installed: ${version}`);
  console.log('');
} catch (error) {
  console.log('   ❌ CLI not found');
  console.log('');
  console.log('   ⚠️  Supabase CLI cannot be installed via npm on Windows');
  console.log('');
  console.log('   📝 Please install using one of these methods:');
  console.log('');
  console.log('   Method 1: Scoop (Recommended)');
  console.log('   ──────────────────────────────────────────────');
  console.log('   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git');
  console.log('   scoop install supabase');
  console.log('');
  console.log('   Method 2: Chocolatey');
  console.log('   ──────────────────────────────────────────────');
  console.log('   choco install supabase');
  console.log('');
  console.log('   Method 3: Use npx (No installation)');
  console.log('   ──────────────────────────────────────────────');
  console.log('   npx supabase@latest login');
  console.log('   npx supabase@latest link --project-ref btyjxckmqzqdqurgoojd');
  console.log('');
  console.log('   📖 See: SUPABASE_CLI_WINDOWS_SETUP.md for details');
  console.log('');
  process.exit(0);
}

// Check if logged in
console.log('2️⃣ Checking authentication...');
try {
  execSync('supabase projects list', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('   ✅ Already logged in');
  console.log('');
} catch (error) {
  console.log('   ⚠️  Not logged in');
  console.log('');
  console.log('   📝 Next step: Login to Supabase');
  console.log('   Run: supabase login');
  console.log('');
  console.log('   This will:');
  console.log('   1. Open your browser');
  console.log('   2. Ask you to authorize the CLI');
  console.log('   3. Return to terminal when done');
  console.log('');
  process.exit(0);
}

// Check if project is linked
console.log('3️⃣ Checking project link...');
try {
  const output = execSync('supabase status', { encoding: 'utf-8', stdio: 'pipe' });
  if (output.includes('btyjxckmqzqdqurgoojd')) {
    console.log('   ✅ Project already linked');
    console.log('');
  } else {
    throw new Error('Not linked');
  }
} catch (error) {
  console.log('   ⚠️  Project not linked');
  console.log('');
  console.log('   📝 Next step: Link your project');
  console.log('   Run: supabase link --project-ref btyjxckmqzqdqurgoojd');
  console.log('');
  console.log('   You\'ll need:');
  console.log('   - Database password (from Supabase Dashboard)');
  console.log('   - Get it from: Settings → Database → Connection string');
  console.log('');
  process.exit(0);
}

// Success!
console.log('═══════════════════════════════════════════════════════════');
console.log('✅ Supabase CLI is fully set up!');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('📋 Available commands:');
console.log('');
console.log('   # Execute SQL file');
console.log('   supabase db execute --file COPY_THIS_SQL.txt');
console.log('');
console.log('   # Generate TypeScript types');
console.log('   supabase gen types typescript --linked > src/types/database.types.ts');
console.log('');
console.log('   # Pull remote schema');
console.log('   supabase db pull');
console.log('');
console.log('   # List projects');
console.log('   supabase projects list');
console.log('');
console.log('🎉 You\'re all set!');
console.log('');

