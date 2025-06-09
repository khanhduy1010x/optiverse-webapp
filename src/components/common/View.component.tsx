import React from 'react';
import { useTheme } from '../../contexts/theme.context';
import { GROUP_CLASSNAMES } from '../../styles';

interface CustomViewProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
const View: React.FC<CustomViewProps> = ({
  className = '',
  style,
  children,
}) => {
  const { theme } = useTheme();

  const themeStyles = {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
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

export default View;
