import { useLanguage } from './use-language';
import { translations } from '@/i18n/translations';

export function useTranslations() {
  const { language } = useLanguage();

  const t = (key: string): any => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Lithuanian if translation not found
        value = translations.lt;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            console.warn(`Translation missing for key: ${key}`);
            return key;
          }
        }
        break;
      }
    }

    return value !== undefined ? value : key;
  };

  return { t, language };
}