import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import vi from './locales/vi';

const namespace = Object.keys(en);

i18n.use(initReactI18next).init({
  resources: {
    en: en,
    vi: vi,
  },
  lng: localStorage.getItem('language') || 'en', // default
  fallbackLng: 'en',
  ns: namespace,
  defaultNS: 'common',
  fallbackNS: namespace,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
