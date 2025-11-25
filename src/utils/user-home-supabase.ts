/**
 * Supabase integration for user_home table
 * Handles saving and loading user home/profile data from Supabase
 */

import { supabase } from '../lib/supabase';
import { BusinessCardData } from '../types/business-card';

interface UserHomeRow {
  id: string;
  user_code: string;
  name: string | null;
  title: string | null;
  business_name: string | null;
  bio: string | null;
  profile_image: string | null;
  avatar_image: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Save user home data to Supabase
 * NOTE: Table is dropped - function disabled
 */
export async function saveUserHomeToSupabase(
  personalData: BusinessCardData['personal'],
  userCode: string
): Promise<{ success: boolean; error?: string }> {
  // Table is dropped - return success but don't actually save
  console.warn('saveUserHomeToSupabase: user_home table is dropped, data not saved');
  return { success: true };
}

/**
 * Load user home data from Supabase
 * NOTE: Table is dropped - function disabled
 */
export async function loadUserHomeFromSupabase(
  userCode: string
): Promise<BusinessCardData['personal'] | null> {
  // Table is dropped - return null
  console.warn('loadUserHomeFromSupabase: user_home table is dropped, returning null');
  return null;
}

/**
 * Check if user home data exists in Supabase
 * NOTE: Table is dropped - function disabled
 */
export async function userHomeExistsInSupabase(userCode: string): Promise<boolean> {
  // Table is dropped - return false
  console.warn('userHomeExistsInSupabase: user_home table is dropped, returning false');
  return false;
}

