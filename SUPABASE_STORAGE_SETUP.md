# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage buckets for background and avatar images.

## Overview

The application uses Supabase Storage to store image files instead of base64 encoding them in the database. This approach:
- Reduces database size
- Improves performance
- Allows better image management
- Supports image versioning

## Storage Buckets Required

1. **`profile-images`** - For background/home images (2MB limit)
2. **`avatar-images`** - For avatar images (2MB limit)

## Setup Steps

### Step 1: Create Storage Buckets

1. **Go to Supabase Storage:**
   - Navigate to: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/storage/buckets

2. **Create `profile-images` bucket:**
   - Click **"New bucket"**
   - Name: `profile-images`
   - **Public bucket**: ✅ Enable (checked)
   - **File size limit**: 2097152 bytes (2MB)
   - Click **"Create bucket"**

3. **Create `avatar-images` bucket:**
   - Click **"New bucket"**
   - Name: `avatar-images`
   - **Public bucket**: ✅ Enable (checked)
   - **File size limit**: 2097152 bytes (2MB)
   - Click **"Create bucket"**

### Step 2: Configure RLS Policies

After creating the buckets, you need to set up Row Level Security (RLS) policies.

1. **Go to SQL Editor:**
   - Navigate to: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql

2. **Run the Storage RLS Policies SQL:**
   - Copy contents from `SETUP_STORAGE_RLS_POLICIES.sql` or `COPY_SETUP_STORAGE_RLS_POLICIES.txt`
   - Paste and run it

### Step 3: Verify Setup

1. **Check buckets exist:**
   - Go to Storage → Buckets
   - You should see both `profile-images` and `avatar-images`

2. **Test upload:**
   - Try uploading an image through the app
   - Check Storage → `profile-images` or `avatar-images` buckets
   - You should see files organized by userCode: `{userCode}/background-{timestamp}.jpg`

## File Naming Convention

- **Background images**: `{userCode}/background-{timestamp}.{ext}`
- **Avatar images**: `{userCode}/avatar-{timestamp}.{ext}`

Example:
- `297d40affe92417cb5b7fb99db535d4b/background-1764044004169.jpg`
- `297d40affe92417cb5b7fb99db535d4b/avatar-1764044004169.png`

This ensures:
- Files are organized by user
- Each upload has a unique name (timestamp prevents conflicts)
- Old versions are preserved for history

## RLS Policies Explained

### For `profile-images` bucket:

1. **Public Read Access**: Anyone can view background images (for profile viewing)
2. **Authenticated Upload**: Only authenticated users can upload
3. **Own Files Delete**: Users can only delete their own files
4. **Own Files Upload**: Users can only upload to their own folder (userCode)

### For `avatar-images` bucket:

1. **Public Read Access**: Anyone can view avatar images (for profile viewing)
2. **Authenticated Upload**: Only authenticated users can upload
3. **Own Files Delete**: Users can only delete their own files
4. **Own Files Upload**: Users can only upload to their own folder (userCode)

## Troubleshooting

### Upload Fails with 403 Forbidden

**Cause**: RLS policies not set up correctly
**Solution**: Run the Storage RLS policies SQL script

### Images Don't Display

**Cause**: Bucket not set to public
**Solution**: Go to Storage → Buckets → Select bucket → Settings → Enable "Public bucket"

### File Size Too Large Error

**Cause**: File exceeds bucket limit
**Solution**: 
- Background: Compress to < 2MB
- Avatar: Compress to < 2MB
- Or increase bucket limit in bucket settings

### Old Images Not Deleted

**Cause**: Deletion might fail silently for backward compatibility
**Solution**: Check browser console for errors. Old base64 images will still work but won't be cleaned up automatically.

## Migration Notes

- Existing base64 images continue to work (backward compatible)
- New uploads use Supabase Storage
- Old base64 data is preserved in `BusinessCardData` but not stored in `user_infos` table
- To migrate existing base64 images to Storage, users need to re-upload them

