import { GroupShareSettings, BusinessCardData } from '../types/business-card';
import { ContactGroup } from '../types/contacts';

const STORAGE_KEY = 'groupShareSettings';

// Default fields that are visible for all groups
export const DEFAULT_VISIBLE_FIELDS = [
  'personal.name',
  'personal.title',
  'personal.businessName',
  'personal.profileImage',
  'contact.phone',
  'contact.email',
];

// All available fields that can be shared
export const ALL_SHAREABLE_FIELDS = [
  // Personal
  'personal.name',
  'personal.title',
  'personal.businessName',
  'personal.bio',
  'personal.profileImage',
  
  // Contact
  'contact.phone',
  'contact.email',
  'contact.address',
  'contact.aiAgent',
  
  // Social Messaging
  'socialMessaging.zalo',
  'socialMessaging.messenger',
  'socialMessaging.telegram',
  'socialMessaging.whatsapp',
  'socialMessaging.kakao',
  'socialMessaging.discord',
  'socialMessaging.wechat',
  
  // Social Channels
  'socialChannels.facebook',
  'socialChannels.linkedin',
  'socialChannels.twitter',
  'socialChannels.youtube',
  'socialChannels.tiktok',
  
  // Profile
  'profile.about',
  'profile.serviceAreas',
  'profile.specialties',
  'profile.experience',
  'profile.languages',
  'profile.certifications',
  
  // Portfolio
  'portfolio',
];

export const FIELD_LABELS: Record<string, string> = {
  'personal.name': 'Name',
  'personal.title': 'Title/Position',
  'personal.businessName': 'Business Name',
  'personal.bio': 'Bio',
  'personal.profileImage': 'Profile Image',
  
  'contact.phone': 'Phone Number',
  'contact.email': 'Email Address',
  'contact.address': 'Physical Address',
  'contact.aiAgent': 'AI Agent Button',
  
  'socialMessaging.zalo': 'Zalo',
  'socialMessaging.messenger': 'Messenger',
  'socialMessaging.telegram': 'Telegram',
  'socialMessaging.whatsapp': 'WhatsApp',
  'socialMessaging.kakao': 'KakaoTalk',
  'socialMessaging.discord': 'Discord',
  'socialMessaging.wechat': 'WeChat',
  
  'socialChannels.facebook': 'Facebook',
  'socialChannels.linkedin': 'LinkedIn',
  'socialChannels.twitter': 'Twitter',
  'socialChannels.youtube': 'YouTube',
  'socialChannels.tiktok': 'TikTok',
  
  'profile.about': 'About Me',
  'profile.serviceAreas': 'Service Areas',
  'profile.specialties': 'Specialties',
  'profile.experience': 'Experience',
  'profile.languages': 'Languages',
  'profile.certifications': 'Certifications',
  
  'portfolio': 'Portfolio',
};

export function getDefaultGroupShareSettings(): GroupShareSettings {
  return {
    'public': [...DEFAULT_VISIBLE_FIELDS],
    'private': [...DEFAULT_VISIBLE_FIELDS],
    'business': [...DEFAULT_VISIBLE_FIELDS],
    'personal': [...DEFAULT_VISIBLE_FIELDS],
  };
}

export function loadGroupShareSettings(): GroupShareSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      
      // Migration: convert old group keys to new ones
      const migratedSettings: GroupShareSettings = {
        'public': settings['public'] || settings['high-potential'] || [...DEFAULT_VISIBLE_FIELDS],
        'private': settings['private'] || settings['low-potential'] || [...DEFAULT_VISIBLE_FIELDS],
        'business': settings['business'] || settings['business-partner'] || [...DEFAULT_VISIBLE_FIELDS],
        'personal': settings['personal'] || [...DEFAULT_VISIBLE_FIELDS],
      };
      
      // Migration: ensure businessName is included if it's missing
      let needsSave = false;
      Object.keys(migratedSettings).forEach(groupKey => {
        const group = groupKey as ContactGroup;
        if (migratedSettings[group] && !migratedSettings[group].includes('personal.businessName')) {
          // Add businessName after title
          const titleIndex = migratedSettings[group].indexOf('personal.title');
          if (titleIndex !== -1) {
            migratedSettings[group].splice(titleIndex + 1, 0, 'personal.businessName');
          } else {
            migratedSettings[group].push('personal.businessName');
          }
          needsSave = true;
        }
      });
      
      // Save migrated settings if there were old keys or businessName was added
      if (settings['high-potential'] || settings['business-partner'] || settings['low-potential'] || needsSave) {
        saveGroupShareSettings(migratedSettings);
      }
      
      return migratedSettings;
    }
  } catch (error) {
    console.error('Error loading group share settings:', error);
  }
  return getDefaultGroupShareSettings();
}

export function saveGroupShareSettings(settings: GroupShareSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving group share settings:', error);
  }
}

export function isFieldVisibleForGroup(fieldPath: string, group: ContactGroup, settings: GroupShareSettings): boolean {
  return settings[group]?.includes(fieldPath) || false;
}

export function toggleFieldForGroup(
  fieldPath: string,
  group: ContactGroup,
  settings: GroupShareSettings
): GroupShareSettings {
  const newSettings = { ...settings };
  const groupFields = [...(newSettings[group] || [])];
  
  const index = groupFields.indexOf(fieldPath);
  if (index > -1) {
    groupFields.splice(index, 1);
  } else {
    groupFields.push(fieldPath);
  }
  
  newSettings[group] = groupFields;
  return newSettings;
}

export function setFieldsForGroup(
  fields: string[],
  group: ContactGroup,
  settings: GroupShareSettings
): GroupShareSettings {
  return {
    ...settings,
    [group]: [...fields],
  };
}

// Helper to filter business card data based on group settings
export function filterDataByGroup(
  data: BusinessCardData,
  group: ContactGroup,
  settings: GroupShareSettings
): Partial<BusinessCardData> {
  const visibleFields = settings[group] || [];
  const filtered: any = {};
  
  visibleFields.forEach(fieldPath => {
    const parts = fieldPath.split('.');
    let current: any = data;
    let target: any = filtered;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) return;
      
      if (!target[part]) {
        target[part] = {};
      }
      current = current[part];
      target = target[part];
    }
    
    const lastPart = parts[parts.length - 1];
    if (current[lastPart] !== undefined) {
      target[lastPart] = current[lastPart];
    }
  });
  
  return filtered;
}