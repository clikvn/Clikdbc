import { useState, useEffect } from 'react';
import { BusinessCardData } from '../types/business-card';
import { loadFilteredBusinessCardData } from '../utils/filtered-data-loader';
import { parseProfileUrl } from '../utils/user-code';
import { useAuth } from './useAuth';

/**
 * Hook that loads filtered business card data and reloads when URL or settings change
 */
export function useFilteredBusinessCardData(): BusinessCardData | null {
  const [data, setData] = useState<BusinessCardData | null>(null);
  const [pathname, setPathname] = useState(window.location.pathname);
  const { user } = useAuth();
  const [authenticatedUserCode, setAuthenticatedUserCode] = useState<string | null>(null);

  // Get authenticated user's userCode - use Supabase UID directly
  useEffect(() => {
    if (user) {
      // Use the Supabase auth UID as the userCode (without dashes)
      const userCode = user.id.replace(/-/g, '');
      setAuthenticatedUserCode(userCode);
    } else {
      setAuthenticatedUserCode(null);
    }
  }, [user]);

  // Listen for URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    // Listen for both popstate (back/forward) and custom route change events
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('routechange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('routechange', handleLocationChange);
    };
  }, []);

  // Listen for group share settings changes
  useEffect(() => {
    const handleSettingsChange = async () => {
      console.log('[useFilteredBusinessCardData] Settings changed, reloading data');
      const data = await loadFilteredBusinessCardData(pathname, authenticatedUserCode);
      setData(data);
    };

    window.addEventListener('groupShareSettingsChanged', handleSettingsChange);

    return () => {
      window.removeEventListener('groupShareSettingsChanged', handleSettingsChange);
    };
  }, [pathname, authenticatedUserCode]);

  // Listen for business card data updates (real-time sync)
  useEffect(() => {
    const handleDataUpdate = async () => {
      console.log('[useFilteredBusinessCardData] Data updated, reloading');
      const data = await loadFilteredBusinessCardData(pathname, authenticatedUserCode);
      setData(data);
    };

    window.addEventListener('businessCardDataUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('businessCardDataUpdated', handleDataUpdate);
    };
  }, [pathname, authenticatedUserCode]);

  // Load data whenever pathname or authenticatedUserCode changes
  useEffect(() => {
    console.log('[useFilteredBusinessCardData] Loading data for pathname:', pathname, 'authenticatedUserCode:', authenticatedUserCode);
    
    // Load fresh from Supabase (no localStorage)
    loadFilteredBusinessCardData(pathname, authenticatedUserCode).then((data) => {
      setData(data);
    }).catch((error) => {
      console.error('Error loading data:', error);
      setData(null);
    });
  }, [pathname, authenticatedUserCode]);

  return data;
}