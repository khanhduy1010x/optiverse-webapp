import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/theme.context';
import { GROUP_CLASSNAMES } from '../../styles';
import { getTypo } from '../../constants/typography.constant';

interface CustomTextProps {
  title: string;
  className?: string;
  style?: React.CSSProperties;
  textType?: 'regular' | 'bold';
  textSize?: number;
  children?: React.ReactNode;
}

const Text: React.FC<CustomTextProps> = ({
  title,
  className = '',
  style,
  textType = 'regular',
  textSize = 20,
  children,
  ...props
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const defaultCSS = `${getTypo(textSize, textType === 'regular')}`;

  return (
    <div
      className={`break-words ${GROUP_CLASSNAMES.transitionColors} ${defaultCSS} ${className}`}
      style={{ color: theme.colors.text,...style }}
      {...props}
    >
      {title}
      {children}
    </div>
  );
};

export default Text;