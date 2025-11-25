import { ContactGroup } from '../types/contacts';

const USER_CODE_KEY = 'user_code';
const DEFAULT_USER_CODE = 'mydbc'; // Default user set by system admin

// Group code mapping for shorter URLs
export const GROUP_CODES: Record<ContactGroup, string> = {
  'public': 'pub',
  'private': 'prv',
  'business': 'biz',
  'personal': 'per',
};

// Reverse mapping for decoding
export const CODE_TO_GROUP: Record<string, ContactGroup> = {
  'pub': 'public',
  'prv': 'private',
  'biz': 'business',
  'per': 'personal',
};

/**
 * Generate a random user code
 */
function generateRandomCode(length: number = 8): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Get or create user code
 */
export function getUserCode(): string {
  try {
    let code = localStorage.getItem(USER_CODE_KEY);
    if (!code) {
      code = generateRandomCode();
      localStorage.setItem(USER_CODE_KEY, code);
    }
    return code;
  } catch (error) {
    console.error('Error getting user code:', error);
    return generateRandomCode();
  }
}

/**
 * Set a custom user code
 */
export function setUserCode(code: string): void {
  try {
    localStorage.setItem(USER_CODE_KEY, code);
  } catch (error) {
    console.error('Error setting user code:', error);
  }
}

/**
 * Generate share URL for a specific group
 */
export function generateShareUrl(group: ContactGroup): string {
  const userCode = getUserCode();
  const groupCode = GROUP_CODES[group];
  return `${window.location.origin}/${userCode}/${groupCode}`;
}

/**
 * Generate share URL using custom group share code
 */
export function generateShareUrlWithCode(userCode: string, shareCode: string): string {
  return `${window.location.origin}/${userCode}/${shareCode}`;
}

/**
 * Generate public profile URL (no group restriction)
 */
export function generatePublicProfileUrl(): string {
  const userCode = getUserCode();
  return `${window.location.origin}/${userCode}`;
}

/**
 * Parse URL path to extract user code and group code
 */
export function parseProfileUrl(pathname?: string): {
  userCode: string | null;
  group: string | null; // Can be legacy short code (pub, prv) OR custom share code (6 chars)
  screen: 'home' | 'contact' | 'profile' | 'portfolio' | null;
  isCMS: boolean; // Whether this is a CMS route
  cmsSection: string | null; // CMS section if on a CMS route
  isLogin: boolean; // Whether this is a login route
  isRegister: boolean; // Whether this is a register route
} {
  // Default to current pathname if not provided
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
  
  // Remove leading slash and split
  const parts = path.replace(/^\//, '').split('/').filter(p => p);
  
  // Handle root path - no userCode
  if (parts.length === 0 || !parts[0]) {
    return { userCode: null, group: null, screen: null, isCMS: false, cmsSection: null, isLogin: false, isRegister: false };
  }
  
  // Check if first part is 'login' or 'register' (root-level routes)
  if (parts[0] === 'login') {
    return { userCode: null, group: null, screen: null, isCMS: false, cmsSection: null, isLogin: true, isRegister: false };
  }
  
  if (parts[0] === 'register') {
    return { userCode: null, group: null, screen: null, isCMS: false, cmsSection: null, isLogin: false, isRegister: true };
  }
  
  // First part is userCode
  const userCode = parts[0];
  
  // Second part could be groupCode, screen, 'studio' (CMS), 'login', or 'register'
  const secondPart = parts[1];
  
  // Check if this is a login route (userCode/login)
  if (secondPart === 'login') {
    return { userCode, group: null, screen: null, isCMS: false, cmsSection: null, isLogin: true, isRegister: false };
  }
  
  // Check if this is a register route (userCode/register)
  if (secondPart === 'register') {
    return { userCode, group: null, screen: null, isCMS: false, cmsSection: null, isLogin: false, isRegister: true };
  }
  
  // Check if this is a CMS route
  if (secondPart === 'studio') {
    const cmsSection = parts[2] || null; // Third part is the CMS section
    return { userCode, group: null, screen: null, isCMS: true, cmsSection, isLogin: false, isRegister: false };
  }
  
  // Third part would be screen if we have a groupCode
  const thirdPart = parts[2];
  
  // Check if second part is a valid legacy group code
  const isLegacyGroupCode = secondPart && CODE_TO_GROUP[secondPart];
  
  // Check if second part looks like a screen name
  const isScreenName = secondPart === 'contact' || secondPart === 'profile' || secondPart === 'portfolio';
  
  let group: string | null = null;
  let screen: 'home' | 'contact' | 'profile' | 'portfolio' | null = null;
  
  if (isLegacyGroupCode) {
    // Legacy short code like 'pub', 'prv'
    group = CODE_TO_GROUP[secondPart];
    // Screen would be in third position
    if (thirdPart === 'contact' || thirdPart === 'profile' || thirdPart === 'portfolio') {
      screen = thirdPart;
    }
  } else if (secondPart && !isScreenName) {
    // Assume it's a custom share code (6+ characters, alphanumeric)
    group = secondPart;
    // Screen would be in third position
    if (thirdPart === 'contact' || thirdPart === 'profile' || thirdPart === 'portfolio') {
      screen = thirdPart;
    }
  } else if (isScreenName) {
    // Second part is a screen name, no group specified
    screen = secondPart;
  }
  
  return { userCode, group, screen, isCMS: false, cmsSection: null, isLogin: false, isRegister: false };
}

/**
 * Build a profile URL with optional group and screen
 */
export function buildProfileUrl(options: {
  userCode?: string;
  group?: ContactGroup | null;
  screen?: 'home' | 'contact' | 'profile' | 'portfolio' | null;
}): string {
  const { userCode = getUserCode(), group = null, screen = null } = options;
  
  let path = `/${userCode}`;
  
  if (group) {
    const groupCode = GROUP_CODES[group];
    path += `/${groupCode}`;
  }
  
  if (screen && screen !== 'home') {
    path += `/${screen}`;
  }
  
  return path;
}

/**
 * Build a CMS URL for a specific user
 */
export function buildCMSUrl(userCode?: string, section?: string): string {
  const code = userCode || getUserCode();
  let path = `/${code}/studio`;
  
  if (section) {
    path += `/${section}`;
  }
  
  return path;
}

/**
 * Build a login URL (root-level route)
 */
export function buildLoginUrl(userCode?: string): string {
  // Always return root-level /login route
  return '/login';
}

/**
 * Build a register URL (root-level route)
 */
export function buildRegisterUrl(userCode?: string): string {
  // Always return root-level /register route
  return '/register';
}

/**
 * Check if the current URL matches our user code
 * This function can optionally check against an authenticated userCode
 */
export function isOwnProfile(pathname: string, authenticatedUserCode?: string | null): boolean {
  const { userCode } = parseProfileUrl(pathname);
  if (!userCode) return false;
  
  // If authenticated userCode is provided, use it; otherwise fallback to localStorage
  if (authenticatedUserCode !== undefined && authenticatedUserCode !== null) {
    return userCode === authenticatedUserCode;
  }
  
  return userCode === getUserCode();
}