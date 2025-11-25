# User Home Table Setup Guide

## Overview

The `user_home` table stores user profile/home data in Supabase, replacing static data with actual user account data.

## Table Structure

The `user_home` table stores:
- `user_code` (text, unique) - Links to user_profiles.user_code
- `name` (text) - User's full name
- `title` (text) - Professional title
- `business_name` (text) - Business/company name
- `bio` (text) - User bio/description
- `profile_image` (text) - JSON string of ProfileImageData (background image)
- `avatar_image` (text) - JSON string of ProfileImageData (avatar image)
- `created_at` (timestamp) - Creation time
- `updated_at` (timestamp) - Last update time

## Setup Steps

### Step 1: Create the Table

1. **Open Supabase SQL Editor:**
   https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql

2. **Click "New Query"**

3. **Copy contents from: `COPY_USER_HOME_SQL.txt`**

4. **Paste and click "Run"**

5. **You should see:**
   ```
   user_home table created successfully!
   ```

### Step 2: Verify Table Creation

1. Go to: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor
2. Click on "user_home" table in the sidebar
3. You should see the table structure

## How It Works

### Data Flow

1. **Saving Data:**
   - When user edits home form in CMS (`/mydbc/studio/home`)
   - Data is saved to both:
     - localStorage (for immediate access and offline support)
     - Supabase `user_home` table (for persistence and cross-device sync)

2. **Loading Data:**
   - When profile page loads (`/mydbc`)
   - System syncs from Supabase first
   - Merges with localStorage data
   - Displays actual user data instead of static data

### Security

- **RLS Policies:**
  - Authenticated users can read/update their own data
  - Public (anon) users can read any user's home data (for profile viewing)
  - Only authenticated users can insert/update/delete

### Migration

- Existing localStorage data is preserved
- On first load, Supabase data takes precedence
- If no Supabase data exists, localStorage data is used
- Data is automatically synced between localStorage and Supabase

## Testing

1. **Create/Edit Profile:**
   - Go to: http://localhost:3000/mydbc/studio/home
   - Edit name, title, bio, images
   - Save changes

2. **View Profile:**
   - Go to: http://localhost:3000/mydbc
   - Should show your actual data from Supabase

3. **Verify in Supabase:**
   - Go to: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor
   - Click "user_home" table
   - You should see your data row

## Troubleshooting

### Profile still shows static data
- **Check**: Table exists in Supabase
- **Check**: RLS policies are set up
- **Check**: Browser console for errors
- **Solution**: Refresh page after creating table

### Data not saving to Supabase
- **Check**: User is authenticated
- **Check**: user_code matches in user_profiles table
- **Check**: Browser console for errors
- **Solution**: Check RLS policies allow INSERT/UPDATE

### Data not loading from Supabase
- **Check**: Data exists in user_home table
- **Check**: user_code matches
- **Check**: Browser console for errors
- **Solution**: Check RLS policies allow SELECT

## Files

- **`COPY_USER_HOME_SQL.txt`** - SQL to create table (use this!)
- **`supabase-user-home-table.sql`** - Detailed SQL with comments
- **`src/utils/user-home-supabase.ts`** - Supabase integration functions
- **`src/utils/storage.ts`** - Updated to sync with Supabase

---

**After running the SQL, your profile will load actual user data from Supabase! 🎉**

