-- Setup RLS policies for Supabase Storage buckets
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql
-- IMPORTANT: Create the buckets first via Supabase Dashboard before running this!

-- ============================================================================
-- PROFILE-IMAGES BUCKET POLICIES
-- ============================================================================

-- Drop existing policies for profile-images bucket (if any)
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Policy 1: Allow public read access to profile-images bucket
CREATE POLICY "Public can view profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Policy 2: Allow authenticated users to upload to their own folder in profile-images
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = REPLACE(auth.uid()::text, '-', '')
);

-- Policy 3: Allow authenticated users to delete their own files from profile-images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = REPLACE(auth.uid()::text, '-', '')
);

-- ============================================================================
-- AVATAR-IMAGES BUCKET POLICIES
-- ============================================================================

-- Drop existing policies for avatar-images bucket (if any)
DROP POLICY IF EXISTS "Public can view avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar images" ON storage.objects;

-- Policy 1: Allow public read access to avatar-images bucket
CREATE POLICY "Public can view avatar images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatar-images');

-- Policy 2: Allow authenticated users to upload to their own folder in avatar-images
CREATE POLICY "Authenticated users can upload avatar images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatar-images' AND
  (storage.foldername(name))[1] = REPLACE(auth.uid()::text, '-', '')
);

-- Policy 3: Allow authenticated users to delete their own files from avatar-images
CREATE POLICY "Users can delete their own avatar images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatar-images' AND
  (storage.foldername(name))[1] = REPLACE(auth.uid()::text, '-', '')
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Storage RLS policies created successfully!';
  RAISE NOTICE 'Buckets: profile-images, avatar-images';
  RAISE NOTICE 'Policies: Public read, Authenticated upload/delete (own files only)';
END $$;

