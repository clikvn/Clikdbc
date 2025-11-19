import { 
  AnalyticsEvent, 
  AnalyticsSession,
  AnalyticsFilters,
  AnalyticsMetrics,
  AnalyticsDashboard,
  GroupAnalytics,
  ContactAnalytics,
  AnalyticsClickTarget,
  getClickCategory,
  getClickTargetLabel,
  AnalyticsDateRange
} from '../types/analytics';
import { loadCustomGroups, getGroupByShareCode } from './custom-groups';
import { Contact } from '../types/contacts';

const EVENTS_STORAGE_KEY = 'clikAnalyticsEvents';
const SESSIONS_STORAGE_KEY = 'clikAnalyticsSessions';

// ============================================================================
// Event Tracking
// ============================================================================

/**
 * Generate a session ID for tracking unique visitors
 * Session expires after 30 minutes of inactivity
 */
export function getOrCreateSessionId(userCode: string, shareCode: string): string {
  const sessionKey = `clikSession_${userCode}_${shareCode}`;
  const stored = sessionStorage.getItem(sessionKey);
  
  if (stored) {
    try {
      const session = JSON.parse(stored);
      const now = Date.now();
      const THIRTY_MINUTES = 30 * 60 * 1000;
      
      // If session is still active (less than 30 min), reuse it
      if (now - session.lastSeen < THIRTY_MINUTES) {
        session.lastSeen = now;
        sessionStorage.setItem(sessionKey, JSON.stringify(session));
        return session.sessionId;
      }
    } catch (e) {
      console.error('Error parsing session:', e);
    }
  }
  
  // Create new session
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const session = {
    sessionId,
    lastSeen: Date.now()
  };
  sessionStorage.setItem(sessionKey, JSON.stringify(session));
  return sessionId;
}

/**
 * Track a page view event
 */
export function trackView(
  userCode: string,
  shareCode: string,
  contactId?: string
): void {
  const sessionId = getOrCreateSessionId(userCode, shareCode);
  
  const event: AnalyticsEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userCode,
    shareCode,
    contactId,
    eventType: 'view',
    timestamp: Date.now(),
    sessionId,
  };
  
  saveEvent(event);
  updateSession(userCode, shareCode, contactId, sessionId, 'view');
}

/**
 * Track a page view for a specific screen
 */
export function trackPageView(
  userCode: string,
  shareCode: string,
  page: 'page.home' | 'page.contact' | 'page.profile' | 'page.portfolio',
  contactId?: string
): void {
  const sessionId = getOrCreateSessionId(userCode, shareCode);
  
  const event: AnalyticsEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userCode,
    shareCode,
    contactId,
    eventType: 'view',
    eventTarget: page,
    timestamp: Date.now(),
    sessionId,
  };
  
  saveEvent(event);
  updateSession(userCode, shareCode, contactId, sessionId, 'view');
}

/**
 * Track a click event
 */
export function trackClick(
  userCode: string,
  shareCode: string,
  target: AnalyticsClickTarget,
  contactId?: string
): void {
  const sessionId = getOrCreateSessionId(userCode, shareCode);
  
  const event: AnalyticsEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userCode,
    shareCode,
    contactId,
    eventType: 'click',
    eventTarget: target,
    timestamp: Date.now(),
    sessionId,
  };
  
  saveEvent(event);
  updateSession(userCode, shareCode, contactId, sessionId, 'click');
}

function saveEvent(event: AnalyticsEvent): void {
  try {
    const key = `${EVENTS_STORAGE_KEY}_${event.userCode}`;
    const stored = localStorage.getItem(key);
    const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
    
    events.push(event);
    
    // Keep only last 10,000 events per user to prevent storage overflow
    const trimmed = events.slice(-10000);
    
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving analytics event:', error);
  }
}

function updateSession(
  userCode: string,
  shareCode: string,
  contactId: string | undefined,
  sessionId: string,
  eventType: 'view' | 'click'
): void {
  try {
    const key = `${SESSIONS_STORAGE_KEY}_${userCode}`;
    const stored = localStorage.getItem(key);
    const sessions: AnalyticsSession[] = stored ? JSON.parse(stored) : [];
    
    const existingIndex = sessions.findIndex(s => s.sessionId === sessionId);
    const now = Date.now();
    
    if (existingIndex >= 0) {
      // Update existing session
      sessions[existingIndex].lastSeen = now;
      if (eventType === 'view') {
        sessions[existingIndex].viewCount++;
      } else {
        sessions[existingIndex].clickCount++;
      }
    } else {
      // Create new session record
      const session: AnalyticsSession = {
        sessionId,
        userCode,
        shareCode,
        contactId,
        firstSeen: now,
        lastSeen: now,
        viewCount: eventType === 'view' ? 1 : 0,
        clickCount: eventType === 'click' ? 1 : 0,
      };
      sessions.push(session);
    }
    
    localStorage.setItem(key, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error updating session:', error);
  }
}

// ============================================================================
// Data Retrieval
// ============================================================================

export function loadEvents(userCode: string): AnalyticsEvent[] {
  try {
    const key = `${EVENTS_STORAGE_KEY}_${userCode}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading analytics events:', error);
    return [];
  }
}

export function loadSessions(userCode: string): AnalyticsSession[] {
  try {
    const key = `${SESSIONS_STORAGE_KEY}_${userCode}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading analytics sessions:', error);
    return [];
  }
}

// ============================================================================
// Filtering
// ============================================================================

function getDateRange(filters: AnalyticsFilters): AnalyticsDateRange {
  const now = Date.now();
  
  if (filters.period === 'custom' && filters.customRange) {
    return filters.customRange;
  }
  
  let daysAgo: number;
  switch (filters.period) {
    case '7d':
      daysAgo = 7;
      break;
    case '30d':
      daysAgo = 30;
      break;
    case '90d':
      daysAgo = 90;
      break;
    default:
      daysAgo = 30;
  }
  
  const startDate = now - (daysAgo * 24 * 60 * 60 * 1000);
  return { startDate, endDate: now };
}

function filterEvents(
  events: AnalyticsEvent[],
  filters: AnalyticsFilters
): AnalyticsEvent[] {
  const { startDate, endDate } = getDateRange(filters);
  
  return events.filter(event => {
    // Time filter
    if (event.timestamp < startDate || event.timestamp > endDate) {
      return false;
    }
    
    // ShareCode filter (group filter)
    if (filters.shareCode && event.shareCode !== filters.shareCode) {
      return false;
    }
    
    // Contact filter
    if (filters.contactId && event.contactId !== filters.contactId) {
      return false;
    }
    
    return true;
  });
}

function filterSessions(
  sessions: AnalyticsSession[],
  filters: AnalyticsFilters
): AnalyticsSession[] {
  const { startDate, endDate } = getDateRange(filters);
  
  return sessions.filter(session => {
    // Time filter
    if (session.firstSeen < startDate || session.firstSeen > endDate) {
      return false;
    }
    
    // ShareCode filter
    if (filters.shareCode && session.shareCode !== filters.shareCode) {
      return false;
    }
    
    // Contact filter
    if (filters.contactId && session.contactId !== filters.contactId) {
      return false;
    }
    
    return true;
  });
}

// ============================================================================
// Metrics Computation
// ============================================================================

function computeMetrics(
  events: AnalyticsEvent[],
  sessions: AnalyticsSession[]
): AnalyticsMetrics {
  const views = events.filter(e => e.eventType === 'view');
  const clicks = events.filter(e => e.eventType === 'click');
  
  // Count by category
  const clicksByCategory = {
    contact: 0,
    messaging: 0,
    social: 0,
    portfolio: 0,
    aiAgent: 0,
  };
  
  const clickCounts: Record<string, number> = {};
  
  clicks.forEach(click => {
    if (click.eventTarget) {
      const category = getClickCategory(click.eventTarget);
      if (category !== 'other') {
        clicksByCategory[category]++;
      }
      
      // Count by specific target
      clickCounts[click.eventTarget] = (clickCounts[click.eventTarget] || 0) + 1;
    }
  });
  
  // Sort and get top items
  const sortedClicks = Object.entries(clickCounts)
    .sort(([, a], [, b]) => b - a);
  
  const topContactMethods = sortedClicks
    .filter(([target]) => getClickCategory(target) === 'contact')
    .slice(0, 5)
    .map(([target, count]) => ({
      target,
      count,
      label: getClickTargetLabel(target),
    }));
  
  const topMessagingApps = sortedClicks
    .filter(([target]) => getClickCategory(target) === 'messaging')
    .slice(0, 5)
    .map(([target, count]) => ({
      target,
      count,
      label: getClickTargetLabel(target),
    }));
  
  const topSocialChannels = sortedClicks
    .filter(([target]) => getClickCategory(target) === 'social')
    .slice(0, 5)
    .map(([target, count]) => ({
      target,
      count,
      label: getClickTargetLabel(target),
    }));
  
  const topPortfolioItems = sortedClicks
    .filter(([target]) => getClickCategory(target) === 'portfolio')
    .slice(0, 5)
    .map(([target, count]) => ({
      target,
      count,
      label: 'Portfolio Item', // Could enhance with actual item names
    }));
  
  // Time series data (by date)
  const viewsByDate: Record<string, number> = {};
  const clicksByDate: Record<string, number> = {};
  
  views.forEach(event => {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    viewsByDate[date] = (viewsByDate[date] || 0) + 1;
  });
  
  clicks.forEach(event => {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    clicksByDate[date] = (clicksByDate[date] || 0) + 1;
  });
  
  const totalViews = views.length;
  const totalClicks = clicks.length;
  
  return {
    totalViews,
    uniqueVisitors: sessions.length,
    totalClicks,
    clickThroughRate: totalViews > 0 ? totalClicks / totalViews : 0,
    contactClicks: clicksByCategory.contact,
    messagingClicks: clicksByCategory.messaging,
    socialClicks: clicksByCategory.social,
    portfolioClicks: clicksByCategory.portfolio,
    aiAgentClicks: clicksByCategory.aiAgent,
    topContactMethods,
    topMessagingApps,
    topSocialChannels,
    topPortfolioItems,
    viewsByDate,
    clicksByDate,
  };
}

// ============================================================================
// Dashboard Data
// ============================================================================

export function getAnalyticsDashboard(
  userCode: string,
  filters: AnalyticsFilters,
  contacts: Contact[] = []
): AnalyticsDashboard {
  const allEvents = loadEvents(userCode);
  const allSessions = loadSessions(userCode);
  
  const filteredEvents = filterEvents(allEvents, filters);
  const filteredSessions = filterSessions(allSessions, filters);
  
  const overallMetrics = computeMetrics(filteredEvents, filteredSessions);
  
  // Breakdown by group
  const groups = loadCustomGroups();
  const groupBreakdown: GroupAnalytics[] = groups.map(group => {
    const groupEvents = filteredEvents.filter(e => e.shareCode === group.shareCode);
    const groupSessions = filteredSessions.filter(s => s.shareCode === group.shareCode);
    
    return {
      shareCode: group.shareCode,
      groupId: group.id,
      groupLabel: group.label,
      groupIcon: group.icon,
      groupColor: group.color,
      metrics: computeMetrics(groupEvents, groupSessions),
    };
  });
  
  // Breakdown by contact (only if we have contacts)
  const contactBreakdown: ContactAnalytics[] = contacts
    .map(contact => {
      const contactEvents = filteredEvents.filter(e => e.contactId === contact.id);
      const contactSessions = filteredSessions.filter(s => s.contactId === contact.id);
      
      // Only include if there's data
      if (contactEvents.length === 0) return null;
      
      const group = getGroupByShareCode(contact.group);
      
      return {
        contactId: contact.id,
        contactName: contact.name,
        contactAvatar: contact.avatar,
        shareCode: contact.group,
        groupLabel: group?.label || contact.group,
        metrics: computeMetrics(contactEvents, contactSessions),
      };
    })
    .filter((c): c is ContactAnalytics => c !== null);
  
  const dateRange = getDateRange(filters);
  
  return {
    userCode,
    filters,
    overallMetrics,
    groupBreakdown,
    contactBreakdown,
    dateRange: {
      start: dateRange.startDate,
      end: dateRange.endDate,
    },
  };
}

// ============================================================================
// Cleanup & Maintenance
// ============================================================================

/**
 * Delete analytics data older than specified days
 */
export function cleanupOldAnalytics(userCode: string, daysToKeep: number = 90): void {
  try {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    // Clean events
    const eventsKey = `${EVENTS_STORAGE_KEY}_${userCode}`;
    const events = loadEvents(userCode);
    const recentEvents = events.filter(e => e.timestamp >= cutoffTime);
    localStorage.setItem(eventsKey, JSON.stringify(recentEvents));
    
    // Clean sessions
    const sessionsKey = `${SESSIONS_STORAGE_KEY}_${userCode}`;
    const sessions = loadSessions(userCode);
    const recentSessions = sessions.filter(s => s.firstSeen >= cutoffTime);
    localStorage.setItem(sessionsKey, JSON.stringify(recentSessions));
    
    console.log(`Cleaned up analytics data older than ${daysToKeep} days`);
  } catch (error) {
    console.error('Error cleaning up analytics:', error);
  }
}

/**
 * Clear all analytics data for a user (useful for testing)
 */
export function clearAllAnalytics(userCode: string): void {
  try {
    localStorage.removeItem(`${EVENTS_STORAGE_KEY}_${userCode}`);
    localStorage.removeItem(`${SESSIONS_STORAGE_KEY}_${userCode}`);
    console.log('Cleared all analytics data');
  } catch (error) {
    console.error('Error clearing analytics:', error);
  }
}