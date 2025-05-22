import React from 'react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '../../constants/typography';
import { useTheme } from '../../contexts/ThemeContext';

interface CustomTextProps {
  title?: string;
  translate?: boolean;
  className?: string;
  style?: React.CSSProperties;
  textStyle?: keyof typeof TEXT; 
  children?: React.ReactNode;
}

const Text: React.FC<CustomTextProps> = ({
  title,
  translate = true,
  className = '',
  style,
  textStyle = 'regular20', 
  children,
  ...props
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const defaultStyles: React.CSSProperties = {
    ...TEXT[textStyle], 
    color: theme.text, 
  };

  return (
    <span
      className={`transition-colors duration-300 ${className}`}
      style={{ ...defaultStyles, ...style }}
      {...props}
    >
      {title ? (translate ? t(`${title}`, { defaultValue: title }) : title) : null}
      {children}
    </span>
  );
};

export default Text;