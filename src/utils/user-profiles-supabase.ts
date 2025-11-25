/**
 * Supabase integration for user_profiles table
 * Handles saving and loading profile information (about, service_areas, specialties, experience, languages, certifications)
 */

import { supabase } from '../lib/supabase';
import { VisibilityGroup } from '../types/business-card';

export interface UserProfile {
  id: string;
  user_code: string;
  
  // Profile Fields
  about: string | null;
  about_groups: VisibilityGroup[];
  service_areas: string | null;
  service_areas_groups: VisibilityGroup[];
  specialties: string | null;
  specialties_groups: VisibilityGroup[];
  experience: string | null;
  experience_groups: VisibilityGroup[];
  languages: string | null;
  languages_groups: VisibilityGroup[];
  certifications: string | null;
  certifications_groups: VisibilityGroup[];
  
  created_at: string;
  updated_at: string;
}

/**
 * Convert JSONB array from database to VisibilityGroup[]
 */
function parseGroups(groups: any): VisibilityGroup[] {
  if (!groups) return ['Public'];
  if (Array.isArray(groups)) {
    return groups.filter(g => ['Public', 'Private', 'Business', 'Personal'].includes(g)) as VisibilityGroup[];
  }
  return ['Public'];
}

/**
 * Convert VisibilityGroup[] to JSONB array for database
 */
function serializeGroups(groups: VisibilityGroup[]): string[] {
  if (!groups || groups.length === 0) return ['Public'];
  return groups.filter(g => ['Public', 'Private', 'Business', 'Personal'].includes(g));
}

/**
 * Save user profile data to Supabase
 */
export async function saveUserProfileToSupabase(
  userCode: string,
  profileData: {
    about: { value: string; groups: VisibilityGroup[] };
    serviceAreas: { value: string; groups: VisibilityGroup[] };
    specialties: { value: string; groups: VisibilityGroup[] };
    experience: { value: string; groups: VisibilityGroup[] };
    languages: { value: string; groups: VisibilityGroup[] };
    certifications: { value: string; groups: VisibilityGroup[] };
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('saveUserProfileToSupabase called with:', { userCode, profileData });
    
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
    
    console.log('Inserting into user_profiles:', {
      user_code: userCode,
      about: profileData.about.value || null,
      about_groups: serializeGroups(profileData.about.groups),
      service_areas: profileData.serviceAreas.value || null,
      service_areas_groups: serializeGroups(profileData.serviceAreas.groups),
      specialties: profileData.specialties.value || null,
      specialties_groups: serializeGroups(profileData.specialties.groups),
      experience: profileData.experience.value || null,
      experience_groups: serializeGroups(profileData.experience.groups),
      languages: profileData.languages.value || null,
      languages_groups: serializeGroups(profileData.languages.groups),
      certifications: profileData.certifications.value || null,
      certifications_groups: serializeGroups(profileData.certifications.groups),
    });
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_code: userCode,
        about: profileData.about.value || null,
        about_groups: serializeGroups(profileData.about.groups),
        service_areas: profileData.serviceAreas.value || null,
        service_areas_groups: serializeGroups(profileData.serviceAreas.groups),
        specialties: profileData.specialties.value || null,
        specialties_groups: serializeGroups(profileData.specialties.groups),
        experience: profileData.experience.value || null,
        experience_groups: serializeGroups(profileData.experience.groups),
        languages: profileData.languages.value || null,
        languages_groups: serializeGroups(profileData.languages.groups),
        certifications: profileData.certifications.value || null,
        certifications_groups: serializeGroups(profileData.certifications.groups),
      }, {
        onConflict: 'user_code'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user profile to Supabase:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error: error.message };
    }

    console.log('User profile saved successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Exception saving user profile to Supabase:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Load user profile data from Supabase
 */
export async function loadUserProfileFromSupabase(
  userCode: string
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_code', userCode)
      .single();

    if (error) {
      // If no row found, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error loading user profile from Supabase:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Convert JSONB groups to VisibilityGroup[]
    return {
      id: data.id,
      user_code: data.user_code,
      about: data.about,
      about_groups: parseGroups(data.about_groups),
      service_areas: data.service_areas,
      service_areas_groups: parseGroups(data.service_areas_groups),
      specialties: data.specialties,
      specialties_groups: parseGroups(data.specialties_groups),
      experience: data.experience,
      experience_groups: parseGroups(data.experience_groups),
      languages: data.languages,
      languages_groups: parseGroups(data.languages_groups),
      certifications: data.certifications,
      certifications_groups: parseGroups(data.certifications_groups),
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as UserProfile;
  } catch (error) {
    console.error('Exception loading user profile from Supabase:', error);
    return null;
  }
}

/**
 * Check if user profile exists in Supabase
 */
export async function userProfileExistsInSupabase(userCode: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_code')
      .eq('user_code', userCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // No row found
      }
      console.error('Error checking user profile existence:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Exception checking user profile existence:', error);
    return false;
  }
}

