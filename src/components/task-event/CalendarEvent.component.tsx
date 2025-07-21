import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';

interface CalendarEventProps {
  event: TaskEvent;
  onClick: () => void;
  style?: React.CSSProperties;
  className?: string;
}

// Chỉ dùng 1 màu tím cho tất cả event
const EVENT_COLOR = {
  bg: 'from-purple-500 to-purple-600',
  border: 'border-purple-400',
  icon: 'text-purple-200'
};

export const CalendarEvent: React.FC<CalendarEventProps> = ({
  event,
  onClick,
  style,
  className
}) => {
  // Luôn dùng màu tím cho mọi event
  const colorSet = EVENT_COLOR;
  
  // Format time range
  const formatTimeRange = () => {
    const startDate = new Date(event.start_time);
    const startTime = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    
    if (event.end_time) {
      const endDate = new Date(event.end_time);
      const endTime = endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
      return `${startTime} - ${endTime}`;
    }
    
    return startTime;
  };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex flex-col items-start rounded-lg p-2 bg-gradient-to-r ${colorSet.bg} border-l-4 ${colorSet.border} shadow-sm hover:shadow-md transition-all duration-200 ${className || ''}`}
      style={style}
    >
      <div className="flex items-center w-full">
        <div className="mr-2">
          <svg className={`w-3.5 h-3.5 ${colorSet.icon}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="font-bold text-white text-sm leading-tight truncate flex-1">{event.title || 'Untitled Event'}</div>
      </div>
      <div className="text-xs text-white/90 mt-1 ml-5.5">{formatTimeRange()}</div>
    </div>
  );
}; 