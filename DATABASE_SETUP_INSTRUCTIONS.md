# Database Setup Instructions

Your Supabase project is configured! Here's how to set up the database.

## Project Details
- **Project URL**: https://btyjxckmqzqdqurgoojd.supabase.co
- **Project Dashboard**: https://app.supabase.com/project/btyjxckmqzqdqurgoojd

## Option 1: Manual Setup (Recommended)

### Step 1: Open Supabase SQL Editor
1. Go to: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql
2. Click "New Query"

### Step 2: Copy and Execute SQL
1. Open the file `supabase-setup.sql` in your project
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click "Run" or press `Ctrl+Enter`

### Step 3: Verify Setup
The SQL script will:
- ✅ Create `user_profiles` table
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create indexes for performance
- ✅ Add automatic profile creation trigger
- ✅ Set up updated_at timestamp automation

You should see a success message in the SQL Editor.

## Option 2: Automated Setup (Alternative)

### Step 1: Install dependencies
```bash
npm install
```

### Step 2: Run setup script
```bash
npm run db:setup
```

### Step 3: Verify setup
```bash
npm run db:verify
```

## What Gets Created

### 1. user_profiles Table
```sql
- id (uuid, primary key) - Links to auth.users
- user_code (text, unique) - Unique identifier for business card
- email (text) - User's email
- created_at (timestamp) - When profile was created
- updated_at (timestamp) - Last update timestamp
```

### 2. Row Level Security (RLS) Policies
- Users can only read/update/delete their own profile
- Automatic authentication checks

### 3. Automatic Triggers
- **Auto-create profile**: When a user signs up, a profile is automatically created
- **Auto-update timestamp**: `updated_at` is automatically updated on changes

### 4. Indexes
- Fast lookups by `user_code`
- Fast lookups by `email`

## Verify Setup Manually

1. Go to: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor
2. Click on "user_profiles" table in the sidebar
3. You should see the table structure with columns: id, user_code, email, created_at, updated_at

## Test Registration

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/myclik/studio

3. Click "Sign up" and register a test account

4. Check Supabase Dashboard:
   - **Authentication → Users**: You should see the new user
   - **Table Editor → user_profiles**: You should see a new profile row

## Troubleshooting

### Error: "relation 'public.user_profiles' does not exist"
- **Solution**: The table hasn't been created yet. Run the SQL script in Supabase SQL Editor.

### Error: "permission denied for table user_profiles"
- **Solution**: RLS policies might not be set up correctly. Re-run the SQL script.

### Profile not created after registration
- **Check**: The trigger `on_auth_user_created` exists in Database → Functions
- **Solution**: Re-run the SQL script to create the trigger

### Can't access other users' profiles
- **This is correct!** RLS policies prevent users from accessing other users' data.

## Next Steps

After setup is complete:
1. ✅ Test user registration
2. ✅ Test user login
3. ✅ Edit business card data
4. ✅ Test profile visibility

## Support

If you encounter issues:
1. Check the SQL Editor output for error messages
2. Verify your Supabase project is active
3. Check the RLS policies in: Database → Policies
4. Review the triggers in: Database → Functions

