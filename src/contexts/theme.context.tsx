import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppTheme, SystemStyle } from '../types/theme.type';
import { generateThemeFromPrimary } from '../utils/theme.util';
import COLORS from '../constants/colors.constant';
import { useTranslation } from 'react-i18next';

const THEME_COLOR_KEY = 'appTheme';
const SYSTEM_STYLE_KEY = 'systemStyle';
const defaultPrimaryColor = COLORS.white900;

interface ThemeContextProps {
  theme: AppTheme;
  primaryColor: string;
  setPrimaryColor: (color?: string) => void;
  resetTheme: () => void;
  toggleTheme: () => void;

  UIStyle: SystemStyle;
  setUIStyle: (style: SystemStyle) => void;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined
);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [primaryColor, setPrimaryColorState] =
    useState<string>(defaultPrimaryColor);
  const [theme, setTheme] = useState<AppTheme>(
    generateThemeFromPrimary(defaultPrimaryColor)
  );
  const [UIStyle, setUIStyleState] = useState<SystemStyle>(SystemStyle.Default);
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedThemed = localStorage.getItem(THEME_COLOR_KEY);
    const savedSystemStyle = localStorage.getItem(SYSTEM_STYLE_KEY);
    if (savedThemed) {
      setPrimaryColor(savedThemed);
    }
    if (savedSystemStyle && Object.values(SystemStyle).includes(savedSystemStyle as SystemStyle)) {
      setUIStyle(savedSystemStyle as SystemStyle);
    }


  }, []);

  const setPrimaryColor = (color?: string) => {
    const safeColor = color ?? defaultPrimaryColor;
    localStorage.setItem(THEME_COLOR_KEY, safeColor);
    setPrimaryColorState(safeColor);
    setTheme(generateThemeFromPrimary(safeColor));
  };

  const resetTheme = () => {
    localStorage.removeItem(THEME_COLOR_KEY);
    setPrimaryColorState(defaultPrimaryColor);
    setTheme(generateThemeFromPrimary(defaultPrimaryColor));
  };

  const toggleTheme = () => {
    console.log(theme.colors.primary);
    console.log(defaultPrimaryColor);

    if (
      theme.colors.primary.toUpperCase() !== defaultPrimaryColor.toUpperCase()
    ) {
      resetTheme();
      return;
    }

    setPrimaryColor(COLORS.black500);
  };

  const setUIStyle = (style: SystemStyle) => {
    const safeStyle = style ?? SystemStyle.Default;
    localStorage.setItem(SYSTEM_STYLE_KEY, safeStyle);
    const isPixel = safeStyle == SystemStyle.Pixel;
    // const isJapanese = i18n.language === 'jp';
    if (isPixel){
      document.documentElement.style.setProperty('--theme-font', `"Pixel"`);
      document.body.classList.add('font-pixel');
    } else {
      document.documentElement.style.removeProperty('--theme-font');
      document.body.classList.remove('font-pixel');
    }
    setUIStyleState(safeStyle);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, primaryColor, setPrimaryColor, resetTheme, toggleTheme, UIStyle, setUIStyle }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
