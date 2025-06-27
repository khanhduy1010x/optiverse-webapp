import React from 'react';

interface TimeIndicatorProps {
  top: number;
}

export const TimeIndicator: React.FC<TimeIndicatorProps> = ({ top }) => {
  return (
    <div className="absolute left-0 right-0 z-10 border-t-2 border-red-500" style={{ top: `${top}px` }}>
      <div className="absolute -left-1 -top-2 w-3 h-3 rounded-full bg-red-500"></div>
    </div>
  );
}; 