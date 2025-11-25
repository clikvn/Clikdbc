-- Update user_infos table to rename business_title to professional_title and add business_name and bio columns
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql

-- 1. Rename business_title to professional_title
ALTER TABLE public.user_infos 
RENAME COLUMN business_title TO professional_title;

-- 2. Add business_name column
ALTER TABLE public.user_infos 
ADD COLUMN IF NOT EXISTS business_name text;

-- 3. Add bio column
ALTER TABLE public.user_infos 
ADD COLUMN IF NOT EXISTS bio text;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'user_infos table updated successfully!';
  RAISE NOTICE 'Columns: business_title -> professional_title, added business_name and bio';
END $$;

