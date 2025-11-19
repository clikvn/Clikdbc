import { LucideIcon } from 'lucide-react';

export interface CustomGroup {
  id: string;
  label: string;
  description: string;
  icon: string; // Icon name from lucide-react
  color: string; // Tailwind color class prefix (e.g., 'blue', 'purple')
  isDefault: boolean; // Whether this is a system default group
  createdAt: number;
  shareCode: string; // 6-character alphanumeric code for secure sharing
}

const STORAGE_KEY = 'customGroups';

// Default groups that come with the system
export const DEFAULT_GROUPS: CustomGroup[] = [
  {
    id: 'public',
    label: 'Public',
    description: 'Anyone with your public link can see this information',
    icon: 'Users',
    color: 'blue',
    isDefault: true,
    createdAt: Date.now(),
    shareCode: 'PUBLIC12',
  },
  {
    id: 'private',
    label: 'Private',
    description: 'Only trusted contacts with your private link can access',
    icon: 'Shield',
    color: 'purple',
    isDefault: true,
    createdAt: Date.now(),
    shareCode: 'PRIVATE1',
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Professional contacts with your business link',
    icon: 'Briefcase',
    color: 'green',
    isDefault: true,
    createdAt: Date.now(),
    shareCode: 'BUSINESS',
  },
  {
    id: 'personal',
    label: 'Personal',
    description: 'Close personal contacts with your personal link',
    icon: 'Heart',
    color: 'pink',
    isDefault: true,
    createdAt: Date.now(),
    shareCode: 'PERSONAL',
  },
];

// Available color options for groups
export const GROUP_COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
  { value: 'green', label: 'Green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
  { value: 'pink', label: 'Pink', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600' },
  { value: 'red', label: 'Red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' },
  { value: 'teal', label: 'Teal', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600' },
  { value: 'cyan', label: 'Cyan', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600' },
  { value: 'indigo', label: 'Indigo', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' },
  { value: 'slate', label: 'Slate', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600' },
];

// Available icon options
export const GROUP_ICON_OPTIONS = [
  'Users', 'Shield', 'Briefcase', 'Heart', 'Star', 'Crown', 'Zap', 
  'Home', 'Building', 'GraduationCap', 'Music', 'Gamepad', 'Camera',
  'Award', 'Target', 'TrendingUp', 'Lock', 'Key', 'Globe', 'MapPin'
];

// Generate a random 6-character alphanumeric code
function generateShareCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

export function loadCustomGroups(): CustomGroup[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const groups: CustomGroup[] = JSON.parse(stored);
      // Migration: Add shareCode to existing groups that don't have it
      let needsSave = false;
      const migratedGroups = groups.map(group => {
        if (!group.shareCode) {
          needsSave = true;
          return {
            ...group,
            shareCode: generateShareCode()
          };
        }
        return group;
      });
      
      if (needsSave) {
        saveCustomGroups(migratedGroups);
        return migratedGroups;
      }
      
      return groups;
    }
  } catch (error) {
    console.error('Error loading custom groups:', error);
  }
  // Return default groups if nothing stored
  const defaults = [...DEFAULT_GROUPS];
  saveCustomGroups(defaults);
  return defaults;
}

export function saveCustomGroups(groups: CustomGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving custom groups:', error);
  }
}

export function createGroup(
  label: string,
  description: string,
  icon: string,
  color: string,
  shareCode?: string
): CustomGroup {
  const groups = loadCustomGroups();
  
  // Check if shareCode already exists
  if (shareCode && groups.some(g => g.shareCode === shareCode)) {
    throw new Error('Share code already exists');
  }
  
  const newGroup: CustomGroup = {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    label,
    description,
    icon,
    color,
    isDefault: false,
    createdAt: Date.now(),
    shareCode: shareCode || generateShareCode(),
  };
  
  groups.push(newGroup);
  saveCustomGroups(groups);
  
  return newGroup;
}

export function updateGroup(
  id: string,
  updates: Partial<Omit<CustomGroup, 'id' | 'isDefault' | 'createdAt'>>
): boolean {
  const groups = loadCustomGroups();
  const index = groups.findIndex(g => g.id === id);
  
  if (index === -1) return false;
  
  groups[index] = {
    ...groups[index],
    ...updates,
  };
  
  saveCustomGroups(groups);
  return true;
}

export function deleteGroup(id: string): boolean {
  const groups = loadCustomGroups();
  const group = groups.find(g => g.id === id);
  
  // Don't allow deleting default groups
  if (!group || group.isDefault) return false;
  
  const filtered = groups.filter(g => g.id !== id);
  saveCustomGroups(filtered);
  
  // Also need to clean up visibility settings for this group
  cleanupGroupVisibilitySettings(id);
  
  return true;
}

function cleanupGroupVisibilitySettings(groupId: string): void {
  try {
    const settingsKey = 'groupShareSettings';
    const stored = localStorage.getItem(settingsKey);
    if (stored) {
      const settings = JSON.parse(stored);
      delete settings[groupId];
      localStorage.setItem(settingsKey, JSON.stringify(settings));
    }
  } catch (error) {
    console.error('Error cleaning up group visibility settings:', error);
  }
}

export function getGroupById(id: string): CustomGroup | undefined {
  const groups = loadCustomGroups();
  return groups.find(g => g.id === id);
}

export function getGroupByShareCode(shareCode: string): CustomGroup | undefined {
  const groups = loadCustomGroups();
  return groups.find(g => g.shareCode === shareCode);
}

export function getColorClasses(color: string) {
  const colorOption = GROUP_COLOR_OPTIONS.find(c => c.value === color);
  return colorOption || GROUP_COLOR_OPTIONS[0];
}