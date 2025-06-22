import React from 'react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '../../constants/typography.constant';
import { useTheme } from '../../contexts/theme.context';
import { GROUP_CLASSNAMES } from '../../styles';

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
    color: theme.colors.text,
  };

  return (
    <div
      className={`break-words ${GROUP_CLASSNAMES.transitionColors} ${className}`}
      style={{ ...defaultStyles, ...style }}
      {...props}
    >
      {title ? (translate ? t(`${title}`, { defaultValue: title }) : title) : null}
      {children}
    </div>
  );
};

export default Text;