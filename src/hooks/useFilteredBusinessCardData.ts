import { useState, useEffect } from 'react';
import { BusinessCardData } from '../types/business-card';
import { loadFilteredBusinessCardData } from '../utils/filtered-data-loader';

/**
 * Hook that loads filtered business card data and reloads when URL or settings change
 */
export function useFilteredBusinessCardData(): BusinessCardData | null {
  const [data, setData] = useState<BusinessCardData | null>(null);
  const [pathname, setPathname] = useState(window.location.pathname);

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
    const handleSettingsChange = () => {
      console.log('[useFilteredBusinessCardData] Settings changed, reloading data');
      setData(loadFilteredBusinessCardData(pathname));
    };

    window.addEventListener('groupShareSettingsChanged', handleSettingsChange);

    return () => {
      window.removeEventListener('groupShareSettingsChanged', handleSettingsChange);
    };
  }, [pathname]);

  // Listen for business card data updates (real-time sync)
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log('[useFilteredBusinessCardData] Data updated, reloading');
      setData(loadFilteredBusinessCardData(pathname));
    };

    window.addEventListener('businessCardDataUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('businessCardDataUpdated', handleDataUpdate);
    };
  }, [pathname]);

  // Load data whenever pathname changes
  useEffect(() => {
    console.log('[useFilteredBusinessCardData] Loading data for pathname:', pathname);
    setData(loadFilteredBusinessCardData(pathname));
  }, [pathname]);

  return data;
}