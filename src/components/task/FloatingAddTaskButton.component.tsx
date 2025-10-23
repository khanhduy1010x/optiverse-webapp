import React, { useState } from 'react';
import Icon from '../common/Icon/Icon.component';

interface FloatingAddTaskButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
  position?: 'bottom-right' | 'center-bottom' | 'full-width';
}

/**
 * FloatingAddTaskButton - Nút thêm task hiện đại
 * 
 * ✨ Features:
 * - Smooth hover animation & shadow effect
 * - Beautiful gradient background
 * - Follow pagination (sticky at bottom)
 * - Responsive design (mobile/tablet/desktop)
 * - Multiple position options
 * - Modern glassmorphism effect
 */
const FloatingAddTaskButton: React.FC<FloatingAddTaskButtonProps> = ({
  onClick,
  title = 'Add Task',
  className = '',
  position = 'bottom-right',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Position mapping
  const positionClass = {
    'bottom-right': 'bottom-6 right-6 sm:bottom-8 sm:right-8',
    'center-bottom': 'bottom-6 left-1/2 -translate-x-1/2 sm:bottom-8',
    'full-width': 'bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8',
  }[position];

  // Size based on position
  const sizeClass =
    position === 'full-width'
      ? 'w-auto px-6 py-3 sm:px-8 sm:py-4'
      : 'w-14 h-14 sm:w-16 sm:h-16';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        ${positionClass}
        ${sizeClass}
        fixed
        z-50
        flex
        items-center
        justify-center
        ${position === 'full-width' ? 'gap-2' : ''}
        rounded-full
        border-0
        transition-all
        duration-300
        ease-in-out
        transform
        ${isHovered ? 'scale-110 -translate-y-1 shadow-2xl' : 'scale-100 shadow-lg'}
        cursor-pointer
        focus:outline-none
        focus:ring-2
        focus:ring-blue-400
        focus:ring-offset-2
        bg-gradient-to-r
        ${isHovered ? 'from-blue-500 to-blue-700' : 'from-blue-400 to-blue-600'}
        hover:from-blue-500
        hover:to-blue-700
        active:scale-95
        ${className}
      `}
      title={title}
      aria-label={title}
      type="button"
    >
      {/* Icon + Text for full-width version */}
      {position === 'full-width' ? (
        <>
          <Icon
            name="add"
            style={{
              color: 'white',
              fontSize: '20px',
            }}
          />
          <span className="text-white font-semibold text-sm">
            {title}
          </span>
        </>
      ) : (
        /* Icon only for circular version */
        <Icon
          name="add"
          style={{
            color: 'white',
            fontSize: '24px',
          }}
        />
      )}
    </button>
  );
};

export default FloatingAddTaskButton;
