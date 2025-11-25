# Supabase CLI Setup Guide

## ✅ Database Verification

Your database is properly configured! ✅
- ✅ Connection successful
- ✅ Authentication service ready
- ✅ user_profiles table exists
- ✅ Ready for user registration

## 🚀 Supabase CLI Installation

### Step 1: Install CLI (if not already installed)

```bash
npm install -g supabase
```

### Step 2: Verify Installation

```bash
supabase --version
```

You should see the version number.

### Step 3: Login to Supabase

```bash
supabase login
```

This will:
1. Open your browser
2. Ask you to authorize the CLI
3. Return to terminal when done

### Step 4: Link Your Project

```bash
supabase link --project-ref btyjxckmqzqdqurgoojd
```

You'll be prompted for:
- **Database password**: Get this from Supabase Dashboard → Settings → Database → Connection string
- **Git branch**: Press Enter for default (main)

### Step 5: Verify Link

```bash
supabase projects list
```

You should see your project listed.

## 📋 Useful CLI Commands

### Database Operations

```bash
# Execute SQL file
supabase db execute --file COPY_THIS_SQL.txt

# Pull remote schema to local
supabase db pull

# Push local migrations to remote
supabase db push

# Generate TypeScript types from database
supabase gen types typescript --linked > src/types/database.types.ts
```

### Migration Management

```bash
# Create a new migration
supabase migration new migration_name

# List migrations
supabase migration list

# Apply migrations
supabase migration up
```

### Project Management

```bash
# List all projects
supabase projects list

# Get project info
supabase projects get btyjxckmqzqdqurgoojd

# Switch project
supabase link --project-ref btyjxckmqzqdqurgoojd
```

### Local Development

```bash
# Start local Supabase (Docker required)
supabase start

# Stop local Supabase
supabase stop

# Reset local database
supabase db reset
```

## 🔧 Quick Setup Script

I've created a setup script for you:

```bash
npm run supabase:setup
```

This will:
1. Check if CLI is installed
2. Guide you through login
3. Link your project
4. Verify connection

## 📝 Project Reference

- **Project Ref**: `btyjxckmqzqdqurgoojd`
- **Project URL**: https://btyjxckmqzqdqurgoojd.supabase.co
- **Dashboard**: https://app.supabase.com/project/btyjxckmqzqdqurgoojd

## 🎯 Next Steps After CLI Setup

1. ✅ Database is verified and working
2. ✅ CLI is installed and linked
3. 🎉 Test user registration:
   - Start dev server: `npm run dev`
   - Navigate to: http://localhost:3000/myclik/studio
   - Click "Sign up" and create a test account

## 🔒 Security Notes

- CLI uses your Supabase account credentials
- Database password is stored locally (encrypted)
- Never commit `.supabase` folder to git
- Service key is in `.env.local` (already in .gitignore)

## 📖 Documentation

- **Supabase CLI Docs**: https://supabase.com/docs/reference/cli
- **Database Migrations**: https://supabase.com/docs/guides/cli/local-development#database-migrations
- **Type Generation**: https://supabase.com/docs/reference/cli/supabase-gen-types-typescript

---

**Your database is ready! Now let's set up the CLI! 🚀**
