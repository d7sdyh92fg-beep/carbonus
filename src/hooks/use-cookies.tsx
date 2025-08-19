import { useState, useEffect } from 'react';

export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always true, can't be disabled
  analytics: false,
  marketing: false,
};

export const useCookies = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has already given consent
    const savedPreferences = localStorage.getItem('carbonus-cookie-preferences');
    const savedConsent = localStorage.getItem('carbonus-cookie-consent');

    if (savedConsent === 'true' && savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        setHasConsent(true);
        setShowBanner(false);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
        setShowBanner(true);
      }
    } else {
      // Show banner if no consent given
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const newPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    
    setPreferences(newPreferences);
    setHasConsent(true);
    setShowBanner(false);
    
    localStorage.setItem('carbonus-cookie-preferences', JSON.stringify(newPreferences));
    localStorage.setItem('carbonus-cookie-consent', 'true');
  };

  const acceptNecessary = () => {
    const newPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    
    setPreferences(newPreferences);
    setHasConsent(true);
    setShowBanner(false);
    
    localStorage.setItem('carbonus-cookie-preferences', JSON.stringify(newPreferences));
    localStorage.setItem('carbonus-cookie-consent', 'true');
  };

  const updatePreferences = (newPreferences: CookiePreferences) => {
    // Ensure necessary cookies are always enabled
    const updatedPreferences = {
      ...newPreferences,
      necessary: true,
    };
    
    setPreferences(updatedPreferences);
    setHasConsent(true);
    setShowBanner(false);
    
    localStorage.setItem('carbonus-cookie-preferences', JSON.stringify(updatedPreferences));
    localStorage.setItem('carbonus-cookie-consent', 'true');
  };

  const resetConsent = () => {
    localStorage.removeItem('carbonus-cookie-preferences');
    localStorage.removeItem('carbonus-cookie-consent');
    setPreferences(DEFAULT_PREFERENCES);
    setHasConsent(false);
    setShowBanner(true);
  };

  return {
    preferences,
    hasConsent,
    showBanner,
    acceptAll,
    acceptNecessary,
    updatePreferences,
    resetConsent,
    setShowBanner,
  };
};