/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../config/theme.config';

const THEME_KEY = 'appTheme';

type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: typeof lightTheme | typeof darkTheme;
  themeType: ThemeType;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('light');
  const [theme, setTheme] = useState(lightTheme);

  // Load theme from localStorage when app opens
  useEffect(() => {
    const loadTheme = () => {
      try {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
          setThemeType(savedTheme as ThemeType);
          setTheme(savedTheme === 'dark' ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  // Function to toggle theme
  const toggleTheme = () => {
    try {
      const newTheme = themeType === 'light' ? 'dark' : 'light';
      setThemeType(newTheme);
      setTheme(newTheme === 'dark' ? darkTheme : lightTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};