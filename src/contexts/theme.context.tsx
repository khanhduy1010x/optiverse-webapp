import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppTheme } from '../types/theme.type';
import { generateThemeFromPrimary } from '../utils/theme.util';
import COLORS from '../constants/colors.constant';

const THEME_COLOR_KEY = 'appTheme';
const defaultPrimaryColor = COLORS.white900;

interface ThemeContextProps {
  theme: AppTheme;
  primaryColor: string;
  setPrimaryColor: (color?: string) => void;
  resetTheme: () => void;
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

  useEffect(() => {
    const saved = localStorage.getItem(THEME_COLOR_KEY);
    if (saved) {
      setPrimaryColor(saved);
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

  return (
    <ThemeContext.Provider
      value={{ theme, primaryColor, setPrimaryColor, resetTheme }}
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
