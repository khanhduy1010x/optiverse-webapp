import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from './locales/en/common.json';
import authEn from './locales/en/auth.json';

import commonVi from './locales/vi/common.json';
import authVi from './locales/vi/auth.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEn,
      auth: authEn,
    },
    vi: {
      common: commonVi,
      auth: authVi,
    },
  },
  lng: localStorage.getItem('language') || 'en', // default
  fallbackLng: 'en',
  ns: ['common', 'auth'], // namespace list
  defaultNS: 'common',
  fallbackNS: ['common', 'auth'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
