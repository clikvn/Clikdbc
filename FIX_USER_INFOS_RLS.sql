-- Fix RLS policies for user_infos table
-- Run this in Supabase SQL Editor if the INSERT policy is blocking inserts

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read their own user_info" ON public.user_infos;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own user_info" ON public.user_infos;
DROP POLICY IF EXISTS "Allow authenticated users to update their own user_info" ON public.user_infos;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own user_info" ON public.user_infos;
DROP POLICY IF EXISTS "Allow public read access to user_infos" ON public.user_infos;

-- Policy: Allow authenticated users to read their own info
-- Simplified: Check if user_code matches the authenticated user's ID (without dashes)
CREATE POLICY "Allow authenticated users to read their own user_info"
ON public.user_infos
FOR SELECT
TO authenticated
USING (
  user_code = REPLACE(auth.uid()::text, '-', '')
);

-- Policy: Allow public read access (for viewing profiles)
CREATE POLICY "Allow public read access to user_infos"
ON public.user_infos
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy: Allow authenticated users to insert their own info
-- Simplified: Check if user_code matches the authenticated user's ID (without dashes)
CREATE POLICY "Allow authenticated users to insert their own user_info"
ON public.user_infos
FOR INSERT
TO authenticated
WITH CHECK (
  user_code = REPLACE(auth.uid()::text, '-', '')
);

-- Policy: Allow authenticated users to update their own info
CREATE POLICY "Allow authenticated users to update their own user_info"
ON public.user_infos
FOR UPDATE
TO authenticated
USING (
  user_code = REPLACE(auth.uid()::text, '-', '')
)
WITH CHECK (
  user_code = REPLACE(auth.uid()::text, '-', '')
);

-- Policy: Allow authenticated users to delete their own info
CREATE POLICY "Allow authenticated users to delete their own user_info"
ON public.user_infos
FOR DELETE
TO authenticated
USING (
  user_code = REPLACE(auth.uid()::text, '-', '')
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'user_infos RLS policies updated successfully!';
END $$;

