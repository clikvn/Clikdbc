import { useState, useEffect } from 'react';
import { ContactGroup } from '../types/contacts';
import { loadGroupShareSettings, saveGroupShareSettings } from '../utils/group-share-settings';
import { parseProfileUrl } from '../utils/user-code';
import { loadCustomGroups, CustomGroup } from '../utils/custom-groups';

/**
 * Hook for managing field visibility across groups (used in CMS)
 */
export function useFieldVisibility() {
  const [groups, setGroups] = useState<CustomGroup[]>([]);
  const [settings, setSettings] = useState(loadGroupShareSettings());

  useEffect(() => {
    setGroups(loadCustomGroups());
  }, []);

  const isFieldVisible = (fieldPath: string, groupId: string): boolean => {
    return settings[groupId]?.includes(fieldPath) || false;
  };

  const toggleField = (fieldPath: string, groupId: string) => {
    const groupFields = [...(settings[groupId] || [])];
    const index = groupFields.indexOf(fieldPath);
    
    if (index > -1) {
      groupFields.splice(index, 1);
    } else {
      groupFields.push(fieldPath);
    }
    
    const newSettings = {
      ...settings,
      [groupId]: groupFields,
    };
    
    setSettings(newSettings);
    saveGroupShareSettings(newSettings);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('groupShareSettingsChanged'));
  };

  return { groups, isFieldVisible, toggleField };
}

/**
 * Hook to check if a field is visible based on current URL group context
 * (used for rendering components on the public-facing card)
 */
export function useIsFieldVisible(fieldPath: string): boolean {
  const [isVisible, setIsVisible] = useState(true);
  const [pathname, setPathname] = useState(window.location.pathname);

  // Listen for URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

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
      checkVisibility();
    };

    window.addEventListener('groupShareSettingsChanged', handleSettingsChange);

    return () => {
      window.removeEventListener('groupShareSettingsChanged', handleSettingsChange);
    };
  }, [pathname, fieldPath]);

  // Check visibility whenever pathname or fieldPath changes
  useEffect(() => {
    checkVisibility();
  }, [pathname, fieldPath]);

  function checkVisibility() {
    // Parse URL to get group context
    const { group: groupCodeOrId } = parseProfileUrl(pathname);
    
    // If no group in URL, show all fields (viewing your own profile)
    if (!groupCodeOrId) {
      setIsVisible(true);
      return;
    }
    
    // Determine group ID from URL
    const customGroups = loadCustomGroups();
    const group = customGroups.find(g => g.shareCode === groupCodeOrId || g.id === groupCodeOrId);
    const groupId = group?.id;
    
    if (!groupId) {
      setIsVisible(true);
      return;
    }
    
    // Check if field is visible for this group
    const settings = loadGroupShareSettings();
    const visible = settings[groupId]?.includes(fieldPath) || false;
    setIsVisible(visible);
  }

  return isVisible;
}
