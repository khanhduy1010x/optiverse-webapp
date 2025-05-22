import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { IconName, ICONS } from '../../../assets/icons';


export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  color?: string;
  transparent?: boolean;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color,
  transparent = false,
  ...props
}) => {
  const theme = useAppSelector((state) => state.theme.theme);

  const SVGIcon = ICONS[name];

  // Màu sắc dựa trên theme (light/dark) nếu không truyền color
  const iconColor = color
    ? color
    : transparent
    ? theme === 'dark'
      ? '#fff'
      : '#000'
    : theme === 'dark'
    ? '#000'
    : '#fff';

  return (
    <SVGIcon
      width={size}
      height={size}
      fill={iconColor}
      {...props}
    />
  );
};

export default Icon;