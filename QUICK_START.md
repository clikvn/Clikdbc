# Quick Start Guide

Get your Digital Business Card app running in 5 minutes!

## 1. Environment Setup ✅

Your `.env` file is already configured with:
- ✅ Supabase URL: https://btyjxckmqzqdqurgoojd.supabase.co
- ✅ Supabase Anon Key: Configured

## 2. Database Setup (Choose one method)

### Method A: Manual (Recommended - 2 minutes)

1. Open Supabase SQL Editor:
   ```
   https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql
   ```

2. Click "New Query"

3. Copy all contents from `supabase-setup.sql` file

4. Paste and click "Run" (or press Ctrl+Enter)

5. You should see: "Database setup completed successfully!"

### Method B: Automated (Alternative)

```bash
npm run db:setup
```

## 3. Verify Database

```bash
npm run db:verify
```

You should see:
- ✅ Connection successful
- ✅ Authentication service ready
- ✅ Database is properly configured

## 4. Start Development Server

```bash
npm run dev
```

Server will start at: http://localhost:3000

## 5. Test Registration

1. Navigate to: http://localhost:3000/myclik/studio

2. Click "Sign up" button

3. Register with:
   - Email: test@example.com
   - Password: test123 (min 6 characters)
   - Confirm Password: test123

4. Click "Create Account"

5. Check Supabase Dashboard:
   - Go to: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/auth/users
   - You should see your new user!

## 6. Login and Edit Business Card

1. After registration, you'll be redirected to login

2. Enter your credentials and sign in

3. You'll see the CMS dashboard

4. Edit your business card sections:
   - Home (background & avatar images)
   - Contact (email, phone, social media)
   - Profile (about, bio)
   - Portfolio (projects, work samples)

## Troubleshooting

### "Missing Supabase environment variables"
- ✅ Already fixed! Your `.env` file is configured

### "relation 'public.user_profiles' does not exist"
- Run the SQL script from `supabase-setup.sql` in Supabase SQL Editor

### Port 3000 already in use
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

## What's Next?

- 📖 Read `USER_REGISTRATION_GUIDE.md` for detailed registration flow
- 🔧 Read `DATABASE_SETUP_INSTRUCTIONS.md` for database details
- 🚀 Read `LOCAL_SETUP_GUIDE.md` for development setup details

## Quick Links

- **Your App**: http://localhost:3000/myclik
- **CMS/Studio**: http://localhost:3000/myclik/studio
- **Supabase Dashboard**: https://app.supabase.com/project/btyjxckmqzqdqurgoojd
- **SQL Editor**: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql
- **Auth Users**: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/auth/users

## Support

Having issues? Check:
1. `.env` file has correct credentials ✅
2. Supabase project is active
3. Database setup is complete (run `npm run db:verify`)
4. Dev server is running (run `npm run dev`)

