-- Create user_profiles table to store profile information
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/btyjxckmqzqdqurgoojd/editor/sql

-- 1. Create the user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_code text NOT NULL UNIQUE,
  
  -- Profile Fields
  about text,
  about_groups jsonb DEFAULT '["Public"]'::jsonb,
  service_areas text,
  service_areas_groups jsonb DEFAULT '["Public"]'::jsonb,
  specialties text,
  specialties_groups jsonb DEFAULT '["Public"]'::jsonb,
  experience text,
  experience_groups jsonb DEFAULT '["Public"]'::jsonb,
  languages text,
  languages_groups jsonb DEFAULT '["Public"]'::jsonb,
  certifications text,
  certifications_groups jsonb DEFAULT '["Public"]'::jsonb,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id)
);

-- 2. Create index for faster lookups by user_code
CREATE INDEX IF NOT EXISTS user_profiles_user_code_idx ON public.user_profiles USING btree (user_code);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read their own user_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own user_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own user_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own user_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow public read access to user_profiles" ON public.user_profiles;

-- 5. Create RLS Policies

-- Policy: Allow authenticated users to read their own profile info
CREATE POLICY "Allow authenticated users to read their own user_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  user_code = REPLACE(auth.uid()::text, '-', '')
);

-- Policy: Allow public read access (for viewing profiles)
CREATE POLICY "Allow public read access to user_profiles"
ON public.user_profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy: Allow authenticated users to insert their own profile info
CREATE POLICY "Allow authenticated users to insert their own user_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  user_code = REPLACE(auth.uid()::text, '-', '')
);

-- Policy: Allow authenticated users to update their own profile info
CREATE POLICY "Allow authenticated users to update their own user_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  user_code = REPLACE(auth.uid()::text, '-', '')
)
WITH CHECK (
  user_code = REPLACE(auth.uid()::text, '-', '')
);

-- Policy: Allow authenticated users to delete their own profile info
CREATE POLICY "Allow authenticated users to delete their own user_profile"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (
  user_code = REPLACE(auth.uid()::text, '-', '')
);

-- 6. Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create a trigger to call the function on update
DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_profiles_updated_at();

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.user_profiles TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'user_profiles table created successfully!';
END $$;

