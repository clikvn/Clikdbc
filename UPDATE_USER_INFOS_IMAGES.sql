-- Add image columns to user_infos table
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql

-- Add image URL and position columns for background image
ALTER TABLE public.user_infos 
ADD COLUMN IF NOT EXISTS profile_image_url text,
ADD COLUMN IF NOT EXISTS profile_image_position jsonb;

-- Add image URL and position columns for avatar image
ALTER TABLE public.user_infos 
ADD COLUMN IF NOT EXISTS avatar_image_url text,
ADD COLUMN IF NOT EXISTS avatar_image_position jsonb;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'user_infos table updated successfully with image columns!';
  RAISE NOTICE 'Added: profile_image_url, profile_image_position, avatar_image_url, avatar_image_position';
END $$;

