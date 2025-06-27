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

export const CalendarEvent: React.FC<CalendarEventProps> = ({
  event,
  onClick,
  style,
  className
}) => {
  // Chọn màu dựa trên ID của sự kiện để đảm bảo màu nhất quán
  const colorIndex = event._id ? Math.abs(event._id.charCodeAt(0) % EVENT_COLORS.length) : 0;
  const colorSet = EVENT_COLORS[colorIndex];
  
  const formatEventTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
      style={style}
      className={`absolute inset-x-1 top-1 bottom-1 rounded-md p-2 cursor-pointer z-20 transition-colors shadow-sm ${className || ''} ${colorSet.bg} overflow-hidden`}
    >
      <div className={`text-xs font-medium ${colorSet.text}`}>{event.title || 'Untitled Event'}</div>
      <div className="text-xs text-gray-600 mt-0.5">{formatTimeRange()}</div>
    </div>
  );
}; 