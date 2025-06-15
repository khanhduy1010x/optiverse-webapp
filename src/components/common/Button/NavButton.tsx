import React from 'react';

interface NavButtonProps {
  label: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ label, isActive = false, onClick, className = '' }) => {
  return (
    <button
      className={`w-full rounded-lg transition-all duration-200 flex items-center justify-center ${isActive ? 'bg-gray-200 dark:bg-gray-600' : ''
        } ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default NavButton;