import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'lt' | 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Get saved language from localStorage or default to 'lt'
    const saved = localStorage.getItem('carbonus-language');
    return (saved === 'en' || saved === 'lt') ? saved : 'lt';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('carbonus-language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}