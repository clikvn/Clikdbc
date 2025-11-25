/**
 * Supabase integration for user_infos table
 * Handles saving and loading user information (user_code, full_name, professional_title, business_name, bio)
 */

import { supabase } from '../lib/supabase';

export interface UserInfo {
  id: string;
  user_code: string;
  full_name: string | null;
  professional_title: string | null;
  business_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
  profile_image_position: { x: number; y: number; scale: number } | null;
  avatar_image_url: string | null;
  avatar_image_position: { x: number; y: number; scale: number } | null;
  created_at: string;
  updated_at: string;
}

/**
 * Save user info to Supabase (including images)
 */
export async function saveUserInfoToSupabase(
  userCode: string,
  fullName: string,
  professionalTitle: string,
  businessName?: string,
  bio?: string,
  profileImageUrl?: string | null,
  profileImagePosition?: { x: number; y: number; scale: number } | null,
  avatarImageUrl?: string | null,
  avatarImagePosition?: { x: number; y: number; scale: number } | null
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('saveUserInfoToSupabase called with:', { 
      userCode, 
      fullName, 
      professionalTitle, 
      businessName, 
      bio,
      profileImageUrl,
      profileImagePosition,
      avatarImageUrl,
      avatarImagePosition
    });
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('User not authenticated:', authError);
      return { success: false, error: 'User not authenticated' };
    }
    
    const expectedUserCode = user.id.replace(/-/g, '');
    if (userCode !== expectedUserCode) {
      console.error('UserCode mismatch:', { provided: userCode, expected: expectedUserCode });
      return { success: false, error: 'UserCode does not match authenticated user' };
    }
    
    console.log('Inserting into user_infos:', {
      user_code: userCode,
      full_name: fullName || null,
      professional_title: professionalTitle || null,
      business_name: businessName || null,
      bio: bio || null,
      profile_image_url: profileImageUrl || null,
      profile_image_position: profileImagePosition || null,
      avatar_image_url: avatarImageUrl || null,
      avatar_image_position: avatarImagePosition || null
    });
    
    const { data, error } = await supabase
      .from('user_infos')
      .upsert({
        user_code: userCode,
        full_name: fullName || null,
        professional_title: professionalTitle || null,
        business_name: businessName || null,
        bio: bio || null,
        profile_image_url: profileImageUrl || null,
        profile_image_position: profileImagePosition || null,
        avatar_image_url: avatarImageUrl || null,
        avatar_image_position: avatarImagePosition || null,
      }, {
        onConflict: 'user_code'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user info to Supabase:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error: error.message };
    }

    console.log('User info saved successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Exception saving user info to Supabase:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Load user info from Supabase
 */
export async function loadUserInfoFromSupabase(
  userCode: string
): Promise<UserInfo | null> {
  try {
    const { data, error } = await supabase
      .from('user_infos')
      .select('id, user_code, full_name, professional_title, business_name, bio, profile_image_url, profile_image_position, avatar_image_url, avatar_image_position, created_at, updated_at')
      .eq('user_code', userCode)
      .single();

    if (error) {
      // If no row found, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error loading user info from Supabase:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return data as UserInfo;
  } catch (error) {
    console.error('Exception loading user info from Supabase:', error);
    return null;
  }
}

/**
 * Check if user info exists in Supabase
 */
export async function userInfoExistsInSupabase(userCode: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_infos')
      .select('user_code')
      .eq('user_code', userCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // No row found
      }
      console.error('Error checking user info existence:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Exception checking user info existence:', error);
    return false;
  }
}

/**
 * Verify if authenticated user exists in both auth.users and user_infos
 * Returns true if user exists, false if user was deleted
 */
export async function verifyUserExists(userId: string): Promise<boolean> {
  try {
    // First check if user exists in auth.users
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || user.id !== userId) {
      console.warn('User not found in auth.users:', authError);
      return false;
    }
    
    // Then check if user exists in user_infos
    const userCode = userId.replace(/-/g, '');
    const exists = await userInfoExistsInSupabase(userCode);
    
    if (!exists) {
      console.warn('User not found in user_infos table:', userCode);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception verifying user existence:', error);
    return false;
  }
}

