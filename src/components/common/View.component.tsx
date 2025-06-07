import React from 'react';
import { useTheme } from '../../contexts/theme.context';
import { GROUP_CLASSNAMES } from '../../styles';

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
      className={`${GROUP_CLASSNAMES.transition} ${className}`}
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
      className={`${GROUP_CLASSNAMES.transition} ${className}`}
      style={{ ...themeStyles, ...style }}
    >
      {children}
    </div>
  );
};

export { ScrollView };
export default View;