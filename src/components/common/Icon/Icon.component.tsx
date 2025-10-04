import React from 'react';
import { IconName, ICONS } from '../../../assets/icons';
import { useTheme } from '../../../contexts/theme.context';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  color?: string;
  inverted?: boolean;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color,
  inverted = false,
  ...props
}) => {
  const { theme } = useTheme();
  const { components } = theme;

  const SVGIcon = ICONS[name];

  // Add null check to prevent undefined element type error
  if (!SVGIcon) {
    console.warn(`Icon "${name}" not found in ICONS`);
    return null;
  }

  const iconColor = color
    ? color
    : inverted
      ? components.button.inverted.text
      : components.button.default.text;

  return <SVGIcon width={size} height={size} fill={iconColor} {...props} />;
};

export default Icon;
