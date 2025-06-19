import { useTranslation } from 'react-i18next';

export const useChangeLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = e => {
    const lang: string = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return { changeLanguage, i18n };
};

export const useAppTranslate = (defaultNS = 'common') => {
  const { t: tOriginal } = useTranslation();

  const trans = (key, values = {}, ns = null) => {
    if (!key) {
      console.warn(`[i18n] Missing key!`);
      return '';
    }

    const nsToUse = ns || defaultNS;
    const text = tOriginal(key, { ns: nsToUse, ...values });

    if (text === key) {
      console.warn(
        `[i18n] Missing translation: "${key}" in ns: "${nsToUse}" (will fallback via i18next config)`
      );
    }

    return text;
  };

  return { t: trans };
};
