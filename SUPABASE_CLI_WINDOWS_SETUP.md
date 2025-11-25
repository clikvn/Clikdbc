# Supabase CLI Setup for Windows

## ✅ Database Status

Your database is verified and working! ✅
- ✅ Connection successful
- ✅ Authentication service ready
- ✅ user_profiles table exists
- ✅ Ready for user registration

## 🚀 Installing Supabase CLI on Windows

Supabase CLI **cannot** be installed via `npm install -g` on Windows. Use one of these methods:

### Method 1: Scoop (Recommended for Windows) ⭐

**Scoop** is a Windows package manager. If you don't have it:

1. **Install Scoop** (PowerShell as Administrator):
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

2. **Install Supabase CLI**:
   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

3. **Verify Installation**:
   ```powershell
   supabase --version
   ```

### Method 2: Chocolatey

If you have **Chocolatey** installed:

```powershell
choco install supabase
```

### Method 3: Direct Download (Manual)

1. **Download the latest release**:
   - Go to: https://github.com/supabase/cli/releases
   - Download: `supabase_X.X.X_windows_amd64.zip`

2. **Extract and add to PATH**:
   - Extract the zip file
   - Copy `supabase.exe` to a folder (e.g., `C:\Tools\supabase\`)
   - Add that folder to your Windows PATH:
     - Search "Environment Variables" in Windows
     - Edit "Path" variable
     - Add: `C:\Tools\supabase\`
     - Click OK

3. **Verify Installation**:
   ```powershell
   supabase --version
   ```

### Method 4: Using npx (No Installation Required)

You can use Supabase CLI without installing it globally:

```powershell
npx supabase@latest --version
npx supabase@latest login
npx supabase@latest link --project-ref btyjxckmqzqdqurgoojd
```

**Note**: This is slower but works without installation.

## 📋 After Installation: Setup Steps

### Step 1: Login to Supabase

```powershell
supabase login
```

This will:
1. Open your browser
2. Ask you to authorize the CLI
3. Return to terminal when done

### Step 2: Link Your Project

```powershell
supabase link --project-ref btyjxckmqzqdqurgoojd
```

You'll be prompted for:
- **Database password**: Get this from:
  - Supabase Dashboard → Settings → Database
  - Find "Connection string" section
  - Copy the password (starts after `postgres:`)
- **Git branch**: Press Enter for default (main)

### Step 3: Verify Link

```powershell
supabase projects list
```

You should see your project listed.

## 📋 Useful CLI Commands

### Database Operations

```powershell
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

```powershell
# Create a new migration
supabase migration new migration_name

# List migrations
supabase migration list

# Apply migrations
supabase migration up
```

### Project Management

```powershell
# List all projects
supabase projects list

# Get project info
supabase projects get btyjxckmqzqdqurgoojd

# Switch project
supabase link --project-ref btyjxckmqzqdqurgoojd
```

## 🎯 Quick Commands (Using npx)

If you don't want to install, use npx:

```powershell
# Login
npx supabase@latest login

# Link project
npx supabase@latest link --project-ref btyjxckmqzqdqurgoojd

# Execute SQL
npx supabase@latest db execute --file COPY_THIS_SQL.txt

# Generate types
npx supabase@latest gen types typescript --linked > src/types/database.types.ts
```

## 📝 Project Reference

- **Project Ref**: `btyjxckmqzqdqurgoojd`
- **Project URL**: https://btyjxckmqzqdqurgoojd.supabase.co
- **Dashboard**: https://app.supabase.com/project/btyjxckmqzqdqurgoojd
- **Database Password**: Get from Dashboard → Settings → Database

## ✅ Verification Checklist

- [ ] Supabase CLI installed (via Scoop, Chocolatey, or manual)
- [ ] CLI verified: `supabase --version`
- [ ] Logged in: `supabase login`
- [ ] Project linked: `supabase link --project-ref btyjxckmqzqdqurgoojd`
- [ ] Can list projects: `supabase projects list`

## 🎉 Next Steps

1. ✅ Database is verified and working
2. ⏳ Install Supabase CLI (choose method above)
3. ⏳ Login and link project
4. 🎉 Test user registration:
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
- **Installation Guide**: https://github.com/supabase/cli#install-the-cli
- **Windows Installation**: https://github.com/supabase/cli#windows
- **Database Migrations**: https://supabase.com/docs/guides/cli/local-development#database-migrations

---

## 💡 Recommendation

**For Windows users, I recommend:**

1. **Use Scoop** (Method 1) - Cleanest installation
2. **Or use npx** (Method 4) - No installation needed, just slower

**Your database is already working! CLI is optional but useful for migrations and type generation.** 🚀

