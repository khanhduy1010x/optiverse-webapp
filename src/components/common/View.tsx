import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface CustomViewProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

interface CustomScrollViewProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const View: React.FC<CustomViewProps> = ({ className = '', style, children }) => {
  const { theme } = useTheme();

  const themeStyles = {
    backgroundColor: theme.background,
    color: theme.text,
  };

  return (
    <div
      className={`transition-all duration-300 ${className}`}
      style={{ ...themeStyles, ...style }}
    >
      {children}
    </div>
  );
};

const ScrollView: React.FC<CustomScrollViewProps> = ({ className = '', style, children }) => {
  const { theme } = useTheme();

  const themeStyles = {
    backgroundColor: theme.background,
    color: theme.text,
    overflowY: 'auto' as const,
  };

  return (
    <div
      className={`transition-all duration-300 ${className}`}
      style={{ ...themeStyles, ...style }}
    >
      {children}
    </div>
  );
};

export { ScrollView };
export default View;