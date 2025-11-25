# ✅ Next Step: Run Database Setup

Your `.env` is now configured correctly! ✅

## Run This SQL Script

### Option 1: Copy & Paste in Supabase (Recommended - 2 minutes)

1. **Open Supabase SQL Editor:**
   https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql

2. **Click "New Query"**

3. **Copy ALL contents from the file: `supabase-setup.sql`**
   - Open `supabase-setup.sql` in your code editor
   - Select all (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)

4. **Paste into SQL Editor**

5. **Click "Run" or press Ctrl+Enter**

6. **Wait for success message:**
   ```
   Database setup completed successfully!
   user_profiles table created with RLS enabled
   Automatic profile creation trigger enabled
   ```

### Option 2: Automated Script (Alternative)

```bash
npm run db:setup
```

## After Running SQL

### Verify Setup
```bash
npm run db:verify
```

Expected output:
```
✅ Connection successful
✅ Authentication service ready
✅ Database is properly configured
```

### Restart Dev Server
```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

### Test Registration
1. Open: http://localhost:3000/myclik/studio
2. Click "Sign up"
3. Register with:
   - Email: test@example.com
   - Password: test123
4. Click "Create Account"

### Verify in Supabase Dashboard
- **Users**: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/auth/users
- **user_profiles table**: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor

You should see:
- ✅ New user in Authentication → Users
- ✅ New profile in Table Editor → user_profiles

## What the SQL Creates

```
user_profiles table
├── id (uuid, primary key) - Links to auth user
├── user_code (text, unique) - Business card identifier  
├── email (text) - User email
├── created_at (timestamp) - Creation time
└── updated_at (timestamp) - Last update time

+ Row Level Security (RLS) policies
+ Auto-create profile trigger
+ Performance indexes
+ Timestamp automation
```

## Quick Links

- **SQL Editor**: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql
- **Auth Users**: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/auth/users
- **Table Editor**: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor

---

**You're almost there! Just run the SQL script and you're done! 🚀**

