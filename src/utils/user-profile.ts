import { supabase } from '../lib/supabase';
import { getUserCode } from './user-code';

export interface UserProfile {
  id: string;
  user_code: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a user profile when a user signs up
 * NOTE: Table is dropped - function disabled
 */
export async function createUserProfile(
  userId: string,
  userCode: string,
  email: string
): Promise<{ data: UserProfile | null; error: Error | null }> {
  // Table is dropped - return null
  console.warn('createUserProfile: user_profiles table is dropped, returning null');
  return { data: null, error: null };
}

/**
 * Get user profile by user ID
 * NOTE: Table is dropped - function disabled
 */
export async function getUserProfile(
  userId: string
): Promise<{ data: UserProfile | null; error: Error | null }> {
  // Table is dropped - return null
  console.warn('getUserProfile: user_profiles table is dropped, returning null');
  return { data: null, error: null };
}

/**
 * Get user code for authenticated user
 */
export async function getUserCodeFromUserId(
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await getUserProfile(userId);
    if (error || !data) {
      return null;
    }
    return data.user_code;
  } catch (error) {
    // Silently handle errors - user might not have a profile yet
    console.warn('Error getting user code from user ID:', error);
    return null;
  }
}

/**
 * Link an existing userCode to a Supabase user ID
 * NOTE: Table is dropped - function disabled
 */
export async function linkUserCodeToUser(
  userCode: string,
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  // Table is dropped - return success but don't actually link
  console.warn('linkUserCodeToUser: user_profiles table is dropped, returning success');
  return { success: true, error: null };
}

/**
 * Ensure user has a profile and user_code linked after authentication
 * NOTE: Table is dropped - function disabled, returns null
 */
export async function ensureUserProfile(
  userId: string,
  email: string
): Promise<string | null> {
  // Table is dropped - return null
  // UserCode is now derived from user.id directly in App.tsx
  console.warn('ensureUserProfile: user_profiles table is dropped, returning null');
  return null;
}


