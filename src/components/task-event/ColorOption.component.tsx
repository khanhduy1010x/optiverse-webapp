import React from 'react';

interface ColorOptionProps {
  color: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export const ColorOption: React.FC<ColorOptionProps> = ({
  color,
  label,
  isSelected,
  onClick
}) => {
  // Use CSS custom properties to avoid inline styles
  return (
    <button
      type="button"
      className={`w-6 h-6 rounded-full cursor-pointer border-2 border-white shadow-md flex items-center justify-center transition-transform duration-200 ${
        isSelected ? 'ring-4 ring-blue-200 scale-110' : 'hover:scale-105'
      }`}
      style={{ backgroundColor: color } as React.CSSProperties}
      onClick={onClick}
      title={label}
      aria-label={`Select ${label} color`}
    />
  );
};
