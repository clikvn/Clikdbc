# Supabase Database Setup Guide

This guide will help you set up the required database table and security policies in your Supabase project for the authentication integration.

## Step 1: Create the `user_profiles` Table

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the following SQL:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_code TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_code ON user_profiles(user_code);

-- Create index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

6. Click **Run** to execute the query

## Step 2: Enable Row Level Security (RLS)

1. Still in the SQL Editor, run this command:

```sql
-- Enable Row Level Security on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

## Step 3: Create RLS Policies

Run the following SQL to create security policies:

```sql
-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

## Step 4: (Optional) Create Trigger to Auto-create Profile on Signup

If you want user profiles to be automatically created when a user signs up, run this:

```sql
-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_code TEXT;
BEGIN
  -- Generate a random user code (8 characters)
  new_user_code := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM user_profiles WHERE user_code = new_user_code) LOOP
    new_user_code := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
  END LOOP;
  
  -- Insert user profile
  INSERT INTO public.user_profiles (id, user_code, email)
  VALUES (NEW.id, new_user_code, NEW.email);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Note:** If you enable this trigger, the user profile will be automatically created when a user signs up. However, the `user_code` will be auto-generated. If you want users to use their existing localStorage `user_code`, you may want to disable this trigger and handle profile creation in your application code instead (which is what the current implementation does via `ensureUserProfile`).

## Verification

After completing the setup, you can verify everything is working:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see the `user_profiles` table
3. Check that RLS is enabled (you'll see a shield icon)
4. Test by signing up a new user and checking if a profile is created

## Troubleshooting

- **If you get a "permission denied" error**: Make sure RLS policies are created correctly
- **If profile is not created on signup**: Check if the trigger is created and enabled
- **If user_code is not unique**: The trigger includes a check for uniqueness, but if you're creating profiles manually, ensure uniqueness

## Security Notes

- RLS policies ensure users can only access their own profiles
- The `id` field references `auth.users(id)` which automatically links to Supabase Auth users
- The `ON DELETE CASCADE` ensures that if a user is deleted from auth, their profile is also deleted


