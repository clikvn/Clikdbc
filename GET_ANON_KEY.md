# How to Get Your Supabase Anon Key

## Important: You Need the ANON Key, Not the Service Key

The key you provided (`sb_secret_...`) appears to be a **Service Key** (secret key), which should **never** be exposed in frontend code.

For this application, you need the **ANON (public) key**, which is safe to use in frontend applications.

## Steps to Get the Correct Keys

### 1. Go to Your Supabase Project Settings
https://app.supabase.com/project/btyjxckmqzqdqurgoojd/settings/api

### 2. Find the API Section
You'll see two keys:

#### Project URL
```
https://btyjxckmqzqdqurgoojd.supabase.co
```
✅ This is correct!

#### API Keys

**anon public** (This is what you need!)
- Looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eWp4Y2ttcXpxZHF1cmdvb2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MDAyMzksImV4cCI6MjA1MzM3NjIzOX0.XXXXXXXXXXXXXXXXXX`
- This is safe to use in your frontend
- Copy this entire key

**service_role secret** (❌ DO NOT USE in frontend)
- Starts with: `sb_secret_` or similar
- This is like a root password - never expose it!
- Only use on secure backend servers

### 3. Update Your .env File

Replace the `.env` file contents with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://btyjxckmqzqdqurgoojd.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

Replace `your_actual_anon_key_here` with the **anon public** key from step 2.

### 4. Verify the Setup

```bash
npm run db:verify
```

## Security Note 🔒

- ✅ **SAFE**: anon public key (starts with `eyJ...`)
- ❌ **DANGEROUS**: service_role secret key (starts with `sb_secret_` or `eyJ...` with "service_role")

The anon key has Row Level Security (RLS) policies enforced, so users can only access their own data. The service key bypasses all security, so it must be kept secret!

## Need Help?

If you're unsure which key to use, look for these labels in the Supabase dashboard:
- **"anon" or "public"** → Use this one ✅
- **"service_role" or "secret"** → Don't use this ❌

