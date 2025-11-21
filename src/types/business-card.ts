export interface PortfolioCategory {
  id: string;
  name: string;
}

export type PortfolioItemType = 'images' | 'video' | 'virtual-tour';

export interface PortfolioItem {
  id: string;
  type: PortfolioItemType;
  title: string;
  description: string;
  categoryId: string;
  // For images type
  images?: string[];
  // For video type
  videoUrl?: string;
  // For virtual tour type
  tourUrl?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export type VisibilityGroup = 'Public' | 'Private' | 'Business' | 'Personal';

// Updated to support dynamic group IDs
export interface GroupShareSettings {
  [groupId: string]: string[]; // Array of visible field paths for any group ID
}

export interface MessagingApp {
  username: string;
  groups: VisibilityGroup[];
}

export interface SocialChannel {
  username: string;
  groups: VisibilityGroup[];
}

export interface ContactField {
  value: string;
  groups: VisibilityGroup[];
}

export interface ProfileField {
  value: string;
  groups: VisibilityGroup[];
}

export interface ProfileImageData {
  imageUrl: string;
  facePosition?: {
    x: number; // percentage from left (0-100)
    y: number; // percentage from top (0-100)
    width: number; // percentage of image width (0-100)
    height: number; // percentage of image height (0-100)
  } | null;
  // Drag/zoom positioning for home background
  position?: {
    x: number; // horizontal offset in pixels
    y: number; // vertical offset in pixels
    scale: number; // zoom level (1.0 = 100%)
  };
  // Drag/zoom positioning for circular avatar
  avatarPosition?: {
    x: number; // horizontal offset in pixels
    y: number; // vertical offset in pixels
    scale: number; // zoom level (1.0 = 100%)
  };
}

export interface BusinessCardData {
  personal: {
    name: string;
    title: string;
    businessName: string;
    bio: string;
    profileImage: string; // JSON string of ProfileImageData or empty string (for background)
    avatarImage: string; // JSON string of ProfileImageData or empty string (for avatar)
  };
  contact: {
    phone: ContactField;
    email: ContactField;
    address: ContactField;
  };
  socialMessaging: {
    zalo: MessagingApp;
    messenger: MessagingApp;
    telegram: MessagingApp;
    whatsapp: MessagingApp;
    kakao: MessagingApp;
    discord: MessagingApp;
    wechat: MessagingApp;
  };
  socialChannels: {
    facebook: SocialChannel;
    linkedin: SocialChannel;
    twitter: SocialChannel;
    youtube: SocialChannel;
    tiktok: SocialChannel;
  };
  portfolioCategories: PortfolioCategory[];
  portfolio: PortfolioItem[];
  profile: {
    about: ProfileField;
    serviceAreas: ProfileField;
    specialties: ProfileField;
    experience: ProfileField;
    languages: ProfileField;
    certifications: ProfileField;
  };
  groupShareSettings?: GroupShareSettings; // Field visibility per contact group
  customLabels?: {
    // Home section
    'personal.name'?: string;
    'personal.title'?: string;
    'personal.businessName'?: string;
    'personal.bio'?: string;
    // Contact section
    'contact.phone'?: string;
    'contact.email'?: string;
    'contact.address'?: string;
    'contact.messaging'?: string;
    'contact.socialChannels'?: string;
    // Profile section
    'profile.about'?: string;
    'profile.serviceAreas'?: string;
    'profile.specialties'?: string;
    'profile.experience'?: string;
    'profile.languages'?: string;
    'profile.certifications'?: string;
    // Portfolio section
    'portfolio.title'?: string;
  };
}

export const defaultBusinessCardData: BusinessCardData = {
  personal: {
    name: "Christine Nguyen",
    title: "Interior Designer",
    businessName: "Design Solutions",
    bio: "Transforming spaces into works of art. Specializing in modern, minimalist designs that blend functionality with elegance.",
    profileImage: "", // Background image
    avatarImage: "" // Avatar image
  },
  contact: {
    phone: { value: "+84 123 456 789", groups: ['Public'] },
    email: { value: "christine@example.com", groups: ['Public'] },
    address: { value: "123 Design Street, District 1, Ho Chi Minh City", groups: ['Public'] }
  },
  socialMessaging: {
    zalo: { username: "", groups: ['Public'] },
    messenger: { username: "christinenguyen", groups: ['Public'] },
    telegram: { username: "christinenguyen", groups: ['Public'] },
    whatsapp: { username: "84123456789", groups: ['Public'] },
    kakao: { username: "christinenguyen", groups: ['Public'] },
    discord: { username: "christinenguyen", groups: ['Public'] },
    wechat: { username: "", groups: ['Public'] }
  },
  socialChannels: {
    facebook: { username: "christinenguyen.interiordesign", groups: ['Public'] },
    linkedin: { username: "christinenguyen", groups: ['Public', 'Business'] },
    twitter: { username: "christinenguyen", groups: ['Public'] },
    youtube: { username: "christinenguyen", groups: ['Public'] },
    tiktok: { username: "christinenguyen", groups: ['Public'] }
  },
  portfolioCategories: [],
  portfolio: [],
  profile: {
    about: { value: "It is my pleasure to assist you with your real estate needs. My number one goal is your complete satisfaction. I would like to take ...", groups: ['Public'] },
    serviceAreas: { value: "Hanoi • Ha Tay • Hoa Binh • Bac Ninh", groups: ['Public'] },
    specialties: { value: "Buyer's Agent • Seller's Agent • Resale • Apartment • Townhouse • Land", groups: ['Public'] },
    experience: { value: "It is my pleasure to assist you with your real estate needs. My number one goal is your complete satisfaction. I would like to take ...", groups: ['Public'] },
    languages: { value: "Vietnamese • English • Korean", groups: ['Public'] },
    certifications: { value: "HN-1108", groups: ['Public'] }
  }
};

// Helper functions to construct URLs from usernames
export const messagingUrlPatterns = {
  zalo: (username: string) => username ? `https://zalo.me/${username}` : '',
  messenger: (username: string) => username ? `https://m.me/${username}` : '',
  telegram: (username: string) => username ? `https://t.me/${username}` : '',
  whatsapp: (username: string) => username ? `https://wa.me/${username}` : '',
  kakao: (username: string) => username ? `kakaotalk://conversations/${username}` : '',
  discord: (username: string) => username ? `https://discord.com/users/${username}` : '',
  wechat: (username: string) => username ? `weixin://dl/chat?${username}` : '',
};

export const socialChannelUrlPatterns = {
  facebook: (username: string) => username ? `https://facebook.com/${username}` : '',
  linkedin: (username: string) => username ? `https://linkedin.com/in/${username}` : '',
  twitter: (username: string) => username ? `https://twitter.com/${username}` : '',
  youtube: (username: string) => username ? `https://youtube.com/@${username}` : '',
  tiktok: (username: string) => username ? `https://tiktok.com/@${username}` : '',
};