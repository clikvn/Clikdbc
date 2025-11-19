import { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  trackView, 
  trackClick, 
  trackPageView,
  getAnalyticsDashboard,
  loadEvents,
  loadSessions 
} from '../utils/analytics';
import { 
  AnalyticsClickTarget, 
  AnalyticsFilters, 
  AnalyticsDashboard,
  AnalyticsPageView 
} from '../types/analytics';
import { Contact } from '../types/contacts';

/**
 * Hook for tracking analytics events
 */
export function useAnalyticsTracking(userCode: string, shareCode: string, contactId?: string) {
  // Track page view on mount (initial visit only, not for each screen)
  useEffect(() => {
    if (userCode && shareCode) {
      trackView(userCode, shareCode, contactId);
    }
  }, [userCode, shareCode, contactId]);

  // Function to track clicks
  const trackClickEvent = useCallback((target: AnalyticsClickTarget) => {
    if (userCode && shareCode) {
      trackClick(userCode, shareCode, target, contactId);
    }
  }, [userCode, shareCode, contactId]);
  
  // Function to track page views for specific screens
  const trackPageViewEvent = useCallback((page: AnalyticsPageView) => {
    if (userCode && shareCode) {
      trackPageView(userCode, shareCode, page, contactId);
    }
  }, [userCode, shareCode, contactId]);

  return { trackClickEvent, trackPageViewEvent };
}

/**
 * Hook for retrieving analytics dashboard data
 */
export function useAnalyticsDashboard(
  userCode: string,
  filters: AnalyticsFilters,
  contacts: Contact[] = []
) {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize dashboard computation
  const computedDashboard = useMemo(() => {
    try {
      if (!userCode) {
        return null;
      }
      const result = getAnalyticsDashboard(userCode, filters, contacts);
      return result;
    } catch (error) {
      console.error('Error computing analytics dashboard:', error);
      return null;
    }
  }, [userCode, filters, contacts]);

  useEffect(() => {
    setIsLoading(true);
    // Simulate async operation (in case we move to Supabase later)
    const timer = setTimeout(() => {
      setDashboard(computedDashboard);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [computedDashboard]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      try {
        const refreshedDashboard = getAnalyticsDashboard(userCode, filters, contacts);
        setDashboard(refreshedDashboard);
        setIsLoading(false);
      } catch (error) {
        console.error('Error refreshing analytics:', error);
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [userCode, filters, contacts]);

  return { dashboard, isLoading, refresh };
}

/**
 * Hook for real-time analytics stats (useful for showing live updates)
 */
export function useAnalyticsStats(userCode: string) {
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  const updateStats = useCallback(() => {
    if (!userCode) return;
    
    const events = loadEvents(userCode);
    const sessions = loadSessions(userCode);
    
    setTotalEvents(events.length);
    setTotalSessions(sessions.length);
  }, [userCode]);

  useEffect(() => {
    updateStats();
  }, [updateStats]);

  return { totalEvents, totalSessions, refresh: updateStats };
}

/**
 * Hook to check if analytics tracking is enabled
 */
export function useAnalyticsEnabled() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Check if user has disabled analytics (future feature)
    const disabled = localStorage.getItem('analyticsDisabled') === 'true';
    setEnabled(!disabled);
  }, []);

  const toggle = useCallback((value: boolean) => {
    setEnabled(value);
    localStorage.setItem('analyticsDisabled', value ? 'false' : 'true');
  }, []);

  return { enabled, toggle };
}