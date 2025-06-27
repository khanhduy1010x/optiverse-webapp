import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { CalendarEvent } from './CalendarEvent.component';
import { TimeIndicator } from './TimeIndicator.component';

// Constants for hour heights
const WORKING_HOURS_START = 8; // 8 AM
const WORKING_HOURS_END = 18; // 6 PM
const CONDENSED_HOURS_HEIGHT = 40; // px - chiều cao cho giờ không quan trọng
const NORMAL_HOURS_HEIGHT = 80; // px - chiều cao cho giờ làm việc

interface DayViewProps {
  currentDate: Date;
  currentTime: Date;
  taskEvents: TaskEvent[];
  handleAddEvent: (date?: Date, hour?: number) => void;
  handleEditEvent: (event: TaskEvent) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  currentTime,
  taskEvents,
  handleAddEvent,
  handleEditEvent
}) => {
  // Format time to display
  const formatHourLabel = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour} ${period}`;
  };

  // Get events for this day
  const getEventsForDay = () => {
    return taskEvents.filter(event => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === currentDate.getDate() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  // Get events for a specific hour
  const getEventForHour = (hour: number) => {
    return getEventsForDay().filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getHours() === hour;
    });
  };

  // Calculate current time indicator position
  const getCurrentTimePosition = () => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    // Calculate position based on hour heights
    let position = 0;
    
    // Add height for hours before current hour
    for (let i = 0; i < currentHour; i++) {
      position += (i >= WORKING_HOURS_START && i <= WORKING_HOURS_END) 
        ? NORMAL_HOURS_HEIGHT 
        : CONDENSED_HOURS_HEIGHT;
    }
    
    // Add partial height for current hour based on minutes
    const hourHeight = (currentHour >= WORKING_HOURS_START && currentHour <= WORKING_HOURS_END) 
      ? NORMAL_HOURS_HEIGHT 
      : CONDENSED_HOURS_HEIGHT;
    
    position += (currentMinute / 60) * hourHeight;
    
    return position;
  };

  // Render hour cell with events
  const renderHourCell = (hour: number) => {
    const events = getEventForHour(hour);
    const isCurrentHour = currentTime.getHours() === hour;
    const isWorkingHour = hour >= WORKING_HOURS_START && hour <= WORKING_HOURS_END;
    const hourHeight = isWorkingHour ? NORMAL_HOURS_HEIGHT : CONDENSED_HOURS_HEIGHT;

    return (
      <div 
        key={hour}
        className={`relative border-b ${isCurrentHour ? 'bg-blue-50' : isWorkingHour ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors ${isWorkingHour ? '' : 'text-gray-400'}`}
        style={{ height: `${hourHeight}px` }}
      >
        <div className="absolute left-0 top-0 p-2 text-sm">
          {formatHourLabel(hour)}
        </div>
        
        {events.map(event => (
          <CalendarEvent
            key={event._id}
            event={event}
            onClick={() => handleEditEvent(event)}
          />
        ))}
      </div>
    );
  };

  // Generate all time slots
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const isToday = 
    currentDate.getDate() === new Date().getDate() &&
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  return (
    <div className="flex-1 overflow-y-auto">
      {hours.map(hour => renderHourCell(hour))}
      
      {isToday && (
        <TimeIndicator top={getCurrentTimePosition()} />
      )}
    </div>
  );
}; 