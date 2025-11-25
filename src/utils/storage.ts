import { BusinessCardData, defaultBusinessCardData, ProfileImageData } from "../types/business-card";
import { getUserCode } from "./user-code";
import { loadUserInfoFromSupabase, saveUserInfoToSupabase, userInfoExistsInSupabase } from "./user-infos-supabase";
import { loadUserContactFromSupabase, saveUserContactToSupabase } from "./user-contacts-supabase";
import { loadUserProfileFromSupabase, saveUserProfileToSupabase } from "./user-profiles-supabase";
import { parseProfileImage } from "./profile-image-utils";

/**
 * Load business card data from Supabase user_infos table
 */
export async function loadBusinessCardData(userCode?: string): Promise<BusinessCardData> {
  try {
    const code = userCode || getUserCode();
    
    // Load user info from user_infos table
    const userInfo = await loadUserInfoFromSupabase(code || '');
    
    // Start with default empty structure
    const data: BusinessCardData = { ...defaultBusinessCardData };
    
    // If user_infos has data, populate personal section
    if (userInfo) {
      data.personal.name = userInfo.full_name || '';
      data.personal.title = userInfo.professional_title || '';
      data.personal.businessName = userInfo.business_name || '';
      data.personal.bio = userInfo.bio || '';
      
      // Reconstruct ProfileImageData from database columns
      // Background image
      if (userInfo.profile_image_url) {
        const profileImageData: ProfileImageData = {
          imageUrl: userInfo.profile_image_url,
          position: userInfo.profile_image_position || undefined,
        };
        data.personal.profileImage = JSON.stringify(profileImageData);
      }
      
      // Avatar image
      if (userInfo.avatar_image_url) {
        const avatarImageData: ProfileImageData = {
          imageUrl: userInfo.avatar_image_url,
          position: userInfo.avatar_image_position || undefined,
        };
        data.personal.avatarImage = JSON.stringify(avatarImageData);
      }
    }
    
    // Load contact data from user_contacts table
    const userContact = await loadUserContactFromSupabase(code || '');
    if (userContact) {
      // Reconstruct contact section
      data.contact = {
        phone: {
          value: userContact.phone || '',
          groups: userContact.phone_groups
        },
        email: {
          value: userContact.email || '',
          groups: userContact.email_groups
        },
        address: {
          value: userContact.address || '',
          groups: userContact.address_groups
        }
      };
      
      // Reconstruct socialMessaging section
      data.socialMessaging = {
        zalo: {
          username: userContact.zalo_username || '',
          groups: userContact.zalo_groups
        },
        messenger: {
          username: userContact.messenger_username || '',
          groups: userContact.messenger_groups
        },
        telegram: {
          username: userContact.telegram_username || '',
          groups: userContact.telegram_groups
        },
        whatsapp: {
          username: userContact.whatsapp_username || '',
          groups: userContact.whatsapp_groups
        },
        kakao: {
          username: userContact.kakao_username || '',
          groups: userContact.kakao_groups
        },
        discord: {
          username: userContact.discord_username || '',
          groups: userContact.discord_groups
        },
        wechat: {
          username: userContact.wechat_username || '',
          groups: userContact.wechat_groups
        }
      };
      
      // Reconstruct socialChannels section
      data.socialChannels = {
        facebook: {
          username: userContact.facebook_username || '',
          groups: userContact.facebook_groups
        },
        linkedin: {
          username: userContact.linkedin_username || '',
          groups: userContact.linkedin_groups
        },
        twitter: {
          username: userContact.twitter_username || '',
          groups: userContact.twitter_groups
        },
        youtube: {
          username: userContact.youtube_username || '',
          groups: userContact.youtube_groups
        },
        tiktok: {
          username: userContact.tiktok_username || '',
          groups: userContact.tiktok_groups
        }
      };
    }
    
    // Load profile data from user_profiles table
    const userProfile = await loadUserProfileFromSupabase(code || '');
    if (userProfile) {
      // Reconstruct profile section
      data.profile = {
        about: {
          value: userProfile.about || '',
          groups: userProfile.about_groups
        },
        serviceAreas: {
          value: userProfile.service_areas || '',
          groups: userProfile.service_areas_groups
        },
        specialties: {
          value: userProfile.specialties || '',
          groups: userProfile.specialties_groups
        },
        experience: {
          value: userProfile.experience || '',
          groups: userProfile.experience_groups
        },
        languages: {
          value: userProfile.languages || '',
          groups: userProfile.languages_groups
        },
        certifications: {
          value: userProfile.certifications || '',
          groups: userProfile.certifications_groups
        }
      };
    }
    
    // Note: Backward compatibility is handled by parseProfileImage() function
    // which can parse both base64 data URLs and Supabase Storage URLs
    // Existing base64 images in the codebase will continue to work
    
    return data;
  } catch (error) {
    console.error("Error loading business card data:", error);
    // Return empty defaults on error
    return { ...defaultBusinessCardData };
  }
}

/**
 * Save business card data to Supabase user_infos table
 */
export async function saveBusinessCardData(data: BusinessCardData, userCode?: string): Promise<void> {
  try {
    const code = userCode || getUserCode();
    
    if (!code) {
      console.error("Cannot save: userCode is required");
      return;
    }
    
    // Extract image URLs and positions from ProfileImageData JSON strings
    let profileImageUrl: string | null = null;
    let profileImagePosition: { x: number; y: number; scale: number } | null = null;
    let avatarImageUrl: string | null = null;
    let avatarImagePosition: { x: number; y: number; scale: number } | null = null;
    
    // Parse profile image (background)
    if (data.personal.profileImage) {
      const profileImageData = parseProfileImage(data.personal.profileImage);
      if (profileImageData) {
        // Only save to database if it's a Supabase Storage URL (not base64)
        if (profileImageData.imageUrl && !profileImageData.imageUrl.startsWith('data:image')) {
          profileImageUrl = profileImageData.imageUrl;
          profileImagePosition = profileImageData.position || null;
        }
      }
    }
    
    // Parse avatar image
    if (data.personal.avatarImage) {
      const avatarImageData = parseProfileImage(data.personal.avatarImage);
      if (avatarImageData) {
        // Only save to database if it's a Supabase Storage URL (not base64)
        if (avatarImageData.imageUrl && !avatarImageData.imageUrl.startsWith('data:image')) {
          avatarImageUrl = avatarImageData.imageUrl;
          avatarImagePosition = avatarImageData.position || null;
        }
      }
    }
    
    // Save personal data (name, title, businessName, bio, images) to user_infos table
    await saveUserInfoToSupabase(
      code,
      data.personal.name || '',
      data.personal.title || '',
      data.personal.businessName || '',
      data.personal.bio || '',
      profileImageUrl,
      profileImagePosition,
      avatarImageUrl,
      avatarImagePosition
    );
    
    // Save contact data to user_contacts table
    await saveUserContactToSupabase(code, {
      contact: data.contact,
      socialMessaging: data.socialMessaging,
      socialChannels: data.socialChannels
    });
    
    // Save profile data to user_profiles table
    await saveUserProfileToSupabase(code, {
      about: data.profile.about,
      serviceAreas: data.profile.serviceAreas,
      specialties: data.profile.specialties,
      experience: data.profile.experience,
      languages: data.profile.languages,
      certifications: data.profile.certifications
    });
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('businessCardDataUpdated', {
      detail: { userCode: code, data }
    }));
  } catch (error) {
    console.error("Error saving business card data to Supabase:", error);
    throw error;
  }
}

/**
 * Check if a user exists (has data in Supabase user_infos table)
 */
export async function userExists(userCode: string): Promise<boolean> {
  try {
    return await userInfoExistsInSupabase(userCode);
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
}

/**
 * Export data as JSON string
 */
export async function exportData(): Promise<string> {
  const data = await loadBusinessCardData();
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON string
 */
export async function importData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString) as BusinessCardData;
    await saveBusinessCardData(data);
    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    return false;
  }
}
