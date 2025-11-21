import { BusinessCardData } from '../types/business-card';
import { ContactGroup } from '../types/contacts';
import { loadBusinessCardData } from './storage';
import { loadGroupShareSettings } from './group-share-settings';
import { parseProfileUrl, getUserCode, isOwnProfile } from './user-code';
import { getGroupByShareCode, loadCustomGroups } from './custom-groups';

/**
 * Check if a field should be visible based on group settings
 */
function isFieldVisible(fieldPath: string, group: ContactGroup | null): boolean {
  if (!group) {
    // No group restriction - show all public fields
    return true;
  }
  
  const settings = loadGroupShareSettings();
  const isVisible = settings[group]?.includes(fieldPath) || false;
  console.log(`[FilteredData] isFieldVisible('${fieldPath}', '${group}'):`, isVisible, 'settings:', settings[group]);
  return isVisible;
}

/**
 * Deep clone an object
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Filter business card data based on group visibility settings
 */
export function loadFilteredBusinessCardData(pathname: string = window.location.pathname): BusinessCardData {
  // Parse URL to get both userCode and group context
  const { userCode, group: groupCodeOrId } = parseProfileUrl(pathname);
  
  // Load data for the specific user
  const data = loadBusinessCardData(userCode || undefined);
  
  // Check if viewing own profile - if so, show all data without filtering
  const viewingOwnProfile = isOwnProfile(pathname);
  if (viewingOwnProfile) {
    console.log('[FilteredData] Viewing own profile - showing all data without filtering');
    return data; // Return unfiltered data when viewing your own profile
  }
  
  // If no group specified in URL, use the first group from custom groups
  let groupId: ContactGroup | null = null;
  
  if (!groupCodeOrId) {
    const customGroups = loadCustomGroups();
    if (customGroups.length > 0) {
      groupId = customGroups[0].id as ContactGroup;
      console.log('[FilteredData] No group in URL, using first group:', groupId);
    } else {
      // Fallback to public if no custom groups exist
      groupId = 'public';
      console.log('[FilteredData] No custom groups found, using public');
    }
  } else {
    // Try to find group by share code first, then fall back to ID for backward compatibility
    const groupByShareCode = getGroupByShareCode(groupCodeOrId);
    groupId = groupByShareCode ? groupByShareCode.id as ContactGroup : groupCodeOrId as ContactGroup;
    console.log('[FilteredData] Group from URL:', groupId);
  }
  
  // Clone data to avoid mutations
  const filtered = deepClone(data);
  
  // Filter personal fields
  if (!isFieldVisible('personal.name', groupId)) {
    filtered.personal.name = '';
  }
  if (!isFieldVisible('personal.title', groupId)) {
    filtered.personal.title = '';
  }
  if (!isFieldVisible('personal.location', groupId)) {
    filtered.personal.location = '';
  }
  if (!isFieldVisible('personal.businessName', groupId)) {
    filtered.personal.businessName = '';
  }
  if (!isFieldVisible('personal.bio', groupId)) {
    filtered.personal.bio = '';
  }
  if (!isFieldVisible('personal.profileImage', groupId)) {
    filtered.personal.profileImage = '';
  }
  if (!isFieldVisible('personal.avatarImage', groupId)) {
    filtered.personal.avatarImage = '';
  }
  
  // Filter contact fields
  if (!isFieldVisible('contact.phone', groupId)) {
    filtered.contact.phone.value = '';
  }
  if (!isFieldVisible('contact.email', groupId)) {
    filtered.contact.email.value = '';
  }
  if (!isFieldVisible('contact.address', groupId)) {
    filtered.contact.address.value = '';
  }
  
  // Filter social messaging
  if (!isFieldVisible('socialMessaging.zalo', groupId)) {
    filtered.socialMessaging.zalo.username = '';
  }
  if (!isFieldVisible('socialMessaging.messenger', groupId)) {
    filtered.socialMessaging.messenger.username = '';
  }
  if (!isFieldVisible('socialMessaging.telegram', groupId)) {
    filtered.socialMessaging.telegram.username = '';
  }
  if (!isFieldVisible('socialMessaging.whatsapp', groupId)) {
    filtered.socialMessaging.whatsapp.username = '';
  }
  if (!isFieldVisible('socialMessaging.kakao', groupId)) {
    filtered.socialMessaging.kakao.username = '';
  }
  if (!isFieldVisible('socialMessaging.discord', groupId)) {
    filtered.socialMessaging.discord.username = '';
  }
  if (!isFieldVisible('socialMessaging.wechat', groupId)) {
    filtered.socialMessaging.wechat.username = '';
  }
  
  // Filter social channels
  if (!isFieldVisible('socialChannels.facebook', groupId)) {
    filtered.socialChannels.facebook.username = '';
  }
  if (!isFieldVisible('socialChannels.linkedin', groupId)) {
    filtered.socialChannels.linkedin.username = '';
  }
  if (!isFieldVisible('socialChannels.twitter', groupId)) {
    filtered.socialChannels.twitter.username = '';
  }
  if (!isFieldVisible('socialChannels.youtube', groupId)) {
    filtered.socialChannels.youtube.username = '';
  }
  if (!isFieldVisible('socialChannels.tiktok', groupId)) {
    filtered.socialChannels.tiktok.username = '';
  }
  
  // Filter profile fields
  if (!isFieldVisible('profile.about', groupId)) {
    filtered.profile.about.value = '';
  }
  if (!isFieldVisible('profile.serviceAreas', groupId)) {
    filtered.profile.serviceAreas.value = '';
  }
  if (!isFieldVisible('profile.specialties', groupId)) {
    filtered.profile.specialties.value = '';
  }
  if (!isFieldVisible('profile.experience', groupId)) {
    filtered.profile.experience.value = '';
  }
  if (!isFieldVisible('profile.languages', groupId)) {
    filtered.profile.languages.value = '';
  }
  if (!isFieldVisible('profile.certifications', groupId)) {
    filtered.profile.certifications.value = '';
  }
  
  // Filter portfolio
  if (!isFieldVisible('portfolio', groupId)) {
    filtered.portfolio = [];
    filtered.portfolioCategories = [];
  }
  
  return filtered;
}

/**
 * Get the current viewing group from URL
 */
export function getCurrentViewingGroup(pathname: string = window.location.pathname): ContactGroup | null {
  const { group: groupCodeOrId } = parseProfileUrl(pathname);
  
  if (!groupCodeOrId) {
    return null;
  }
  
  // Try to find group by share code first, then fall back to ID for backward compatibility
  const groupByShareCode = getGroupByShareCode(groupCodeOrId);
  return groupByShareCode ? groupByShareCode.id : groupCodeOrId;
}