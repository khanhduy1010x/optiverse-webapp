import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Set locale to en-US for consistent date/time formatting with AM/PM
if (typeof window !== 'undefined') {
  // For browser environment
  if (window.Intl && Intl.DateTimeFormat) {
    Intl.DateTimeFormat().resolvedOptions().locale = 'en-US';
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          // Add your translations here
        }
      }
    },
    lng: 'en-US', // Use en-US instead of just 'en'
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n; 