import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';

interface CalendarEventProps {
  event: TaskEvent;
  onClick: () => void;
  style?: React.CSSProperties;
  className?: string;
}

// Danh sách các màu cho sự kiện - pastel colors theo thiết kế mẫu
const EVENT_COLORS = [
  {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200'
  },
  {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-200'
  }
];

// Map of color values to tailwind classes
const COLOR_MAP: Record<string, { bg: string, text: string, border: string }> = {
  '#3B82F6': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },   // Blue
  '#F87171': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },     // Red
  '#FBBF24': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' }, // Yellow
  '#10B981': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },  // Green
  '#A78BFA': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' }, // Purple
};

export const CalendarEvent: React.FC<CalendarEventProps> = ({
  event,
  onClick,
  style,
  className
}) => {
  // Use the event's color if available, otherwise use a color based on the event ID
  let colorSet;
  
  if (event.color && COLOR_MAP[event.color]) {
    colorSet = COLOR_MAP[event.color];
  } else {
    // Fallback to the old method if no color is specified
    const colorIndex = event._id ? Math.abs(event._id.charCodeAt(0) % EVENT_COLORS.length) : 0;
    colorSet = EVENT_COLORS[colorIndex];
  }
  
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

  // Luôn hiển thị block lớn, không compact view
  return (
    <div
      onClick={onClick}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '6px 10px',
        background: '#039BE5',
        borderRadius: 6,
        ...style
      }}
      className={`cursor-pointer flex flex-col items-start ${className || ''}`}
    >
      <div className="font-bold text-white text-base leading-tight w-full" style={{whiteSpace: 'normal'}}>{event.title || 'Untitled Event'}</div>
      <div className="text-xs text-white/90 mt-1 w-full">{formatTimeRange()}</div>
      {event.description && (
        <div className="text-xs text-white/80 mt-1 line-clamp-2 w-full">{event.description}</div>
      )}
    </div>
  );
}; 