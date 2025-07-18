import React, { useState } from 'react';

interface RefreshButtonProps {
  onClick: () => void;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick }) => {
  const [isRotating, setIsRotating] = useState(false);
  
  const handleClick = () => {
    setIsRotating(true);
    onClick();
    
    // Reset animation after completion
    setTimeout(() => {
      setIsRotating(false);
    }, 1000);
  };
  
  return (
    <button
      onClick={handleClick}
      className="p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
      aria-label="Refresh"
      title="Refresh calendar"
    >
      <svg 
        className={`w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors ${isRotating ? 'animate-spin' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
    </button>
  );
}; 