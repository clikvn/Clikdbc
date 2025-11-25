/**
 * Supabase integration for user_contacts table
 * Handles saving and loading contact information (phone, email, address, messaging apps, social channels)
 */

import { supabase } from '../lib/supabase';
import { VisibilityGroup } from '../types/business-card';

export interface UserContact {
  id: string;
  user_code: string;
  
  // Contact Fields
  phone: string | null;
  phone_groups: VisibilityGroup[];
  email: string | null;
  email_groups: VisibilityGroup[];
  address: string | null;
  address_groups: VisibilityGroup[];
  
  // Messaging Apps
  zalo_username: string | null;
  zalo_groups: VisibilityGroup[];
  messenger_username: string | null;
  messenger_groups: VisibilityGroup[];
  telegram_username: string | null;
  telegram_groups: VisibilityGroup[];
  whatsapp_username: string | null;
  whatsapp_groups: VisibilityGroup[];
  kakao_username: string | null;
  kakao_groups: VisibilityGroup[];
  discord_username: string | null;
  discord_groups: VisibilityGroup[];
  wechat_username: string | null;
  wechat_groups: VisibilityGroup[];
  
  // Social Channels
  facebook_username: string | null;
  facebook_groups: VisibilityGroup[];
  linkedin_username: string | null;
  linkedin_groups: VisibilityGroup[];
  twitter_username: string | null;
  twitter_groups: VisibilityGroup[];
  youtube_username: string | null;
  youtube_groups: VisibilityGroup[];
  tiktok_username: string | null;
  tiktok_groups: VisibilityGroup[];
  
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
 * Save user contact data to Supabase
 */
export async function saveUserContactToSupabase(
  userCode: string,
  contactData: {
    contact: {
      phone: { value: string; groups: VisibilityGroup[] };
      email: { value: string; groups: VisibilityGroup[] };
      address: { value: string; groups: VisibilityGroup[] };
    };
    socialMessaging: {
      zalo: { username: string; groups: VisibilityGroup[] };
      messenger: { username: string; groups: VisibilityGroup[] };
      telegram: { username: string; groups: VisibilityGroup[] };
      whatsapp: { username: string; groups: VisibilityGroup[] };
      kakao: { username: string; groups: VisibilityGroup[] };
      discord: { username: string; groups: VisibilityGroup[] };
      wechat: { username: string; groups: VisibilityGroup[] };
    };
    socialChannels: {
      facebook: { username: string; groups: VisibilityGroup[] };
      linkedin: { username: string; groups: VisibilityGroup[] };
      twitter: { username: string; groups: VisibilityGroup[] };
      youtube: { username: string; groups: VisibilityGroup[] };
      tiktok: { username: string; groups: VisibilityGroup[] };
    };
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('saveUserContactToSupabase called with:', { userCode, contactData });
    
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
    
    const { contact, socialMessaging, socialChannels } = contactData;
    
    console.log('Inserting into user_contacts:', {
      user_code: userCode,
      phone: contact.phone.value || null,
      phone_groups: serializeGroups(contact.phone.groups),
      email: contact.email.value || null,
      email_groups: serializeGroups(contact.email.groups),
      address: contact.address.value || null,
      address_groups: serializeGroups(contact.address.groups),
      // ... messaging and channels
    });
    
    const { data, error } = await supabase
      .from('user_contacts')
      .upsert({
        user_code: userCode,
        // Contact Fields
        phone: contact.phone.value || null,
        phone_groups: serializeGroups(contact.phone.groups),
        email: contact.email.value || null,
        email_groups: serializeGroups(contact.email.groups),
        address: contact.address.value || null,
        address_groups: serializeGroups(contact.address.groups),
        // Messaging Apps
        zalo_username: socialMessaging.zalo.username || null,
        zalo_groups: serializeGroups(socialMessaging.zalo.groups),
        messenger_username: socialMessaging.messenger.username || null,
        messenger_groups: serializeGroups(socialMessaging.messenger.groups),
        telegram_username: socialMessaging.telegram.username || null,
        telegram_groups: serializeGroups(socialMessaging.telegram.groups),
        whatsapp_username: socialMessaging.whatsapp.username || null,
        whatsapp_groups: serializeGroups(socialMessaging.whatsapp.groups),
        kakao_username: socialMessaging.kakao.username || null,
        kakao_groups: serializeGroups(socialMessaging.kakao.groups),
        discord_username: socialMessaging.discord.username || null,
        discord_groups: serializeGroups(socialMessaging.discord.groups),
        wechat_username: socialMessaging.wechat.username || null,
        wechat_groups: serializeGroups(socialMessaging.wechat.groups),
        // Social Channels
        facebook_username: socialChannels.facebook.username || null,
        facebook_groups: serializeGroups(socialChannels.facebook.groups),
        linkedin_username: socialChannels.linkedin.username || null,
        linkedin_groups: serializeGroups(socialChannels.linkedin.groups),
        twitter_username: socialChannels.twitter.username || null,
        twitter_groups: serializeGroups(socialChannels.twitter.groups),
        youtube_username: socialChannels.youtube.username || null,
        youtube_groups: serializeGroups(socialChannels.youtube.groups),
        tiktok_username: socialChannels.tiktok.username || null,
        tiktok_groups: serializeGroups(socialChannels.tiktok.groups),
      }, {
        onConflict: 'user_code'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user contact to Supabase:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error: error.message };
    }

    console.log('User contact saved successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Exception saving user contact to Supabase:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Load user contact data from Supabase
 */
export async function loadUserContactFromSupabase(
  userCode: string
): Promise<UserContact | null> {
  try {
    const { data, error } = await supabase
      .from('user_contacts')
      .select('*')
      .eq('user_code', userCode)
      .single();

    if (error) {
      // If no row found, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error loading user contact from Supabase:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Convert JSONB groups to VisibilityGroup[]
    return {
      id: data.id,
      user_code: data.user_code,
      phone: data.phone,
      phone_groups: parseGroups(data.phone_groups),
      email: data.email,
      email_groups: parseGroups(data.email_groups),
      address: data.address,
      address_groups: parseGroups(data.address_groups),
      zalo_username: data.zalo_username,
      zalo_groups: parseGroups(data.zalo_groups),
      messenger_username: data.messenger_username,
      messenger_groups: parseGroups(data.messenger_groups),
      telegram_username: data.telegram_username,
      telegram_groups: parseGroups(data.telegram_groups),
      whatsapp_username: data.whatsapp_username,
      whatsapp_groups: parseGroups(data.whatsapp_groups),
      kakao_username: data.kakao_username,
      kakao_groups: parseGroups(data.kakao_groups),
      discord_username: data.discord_username,
      discord_groups: parseGroups(data.discord_groups),
      wechat_username: data.wechat_username,
      wechat_groups: parseGroups(data.wechat_groups),
      facebook_username: data.facebook_username,
      facebook_groups: parseGroups(data.facebook_groups),
      linkedin_username: data.linkedin_username,
      linkedin_groups: parseGroups(data.linkedin_groups),
      twitter_username: data.twitter_username,
      twitter_groups: parseGroups(data.twitter_groups),
      youtube_username: data.youtube_username,
      youtube_groups: parseGroups(data.youtube_groups),
      tiktok_username: data.tiktok_username,
      tiktok_groups: parseGroups(data.tiktok_groups),
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as UserContact;
  } catch (error) {
    console.error('Exception loading user contact from Supabase:', error);
    return null;
  }
}

/**
 * Check if user contact exists in Supabase
 */
export async function userContactExistsInSupabase(userCode: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_contacts')
      .select('user_code')
      .eq('user_code', userCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // No row found
      }
      console.error('Error checking user contact existence:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Exception checking user contact existence:', error);
    return false;
  }
}

