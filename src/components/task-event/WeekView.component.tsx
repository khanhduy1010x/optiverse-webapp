import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { CalendarEvent } from './CalendarEvent.component';
import { TimeIndicator } from './TimeIndicator.component';

// Constants for hour heights
const WORKING_HOURS_START = 7; // 7 AM
const WORKING_HOURS_END = 19; // 7 PM
const CONDENSED_HOURS_HEIGHT = 40; // px
const NORMAL_HOURS_HEIGHT = 60; // px
const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface WeekViewProps {
  currentDate: Date;
  currentTime: Date;
  taskEvents: TaskEvent[];
  handleAddEvent: (date?: Date, hour?: number) => void;
  handleEditEvent: (event: TaskEvent) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  currentTime,
  taskEvents,
  handleAddEvent,
  handleEditEvent
}) => {
  // Get start of week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  // Get days in the current week
  const getDaysInWeek = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const daysInWeek = getDaysInWeek();

  // Format time to display
  const formatHourLabel = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}${period.toLowerCase()}`;
  };

  // Get events for a specific day
  const getEventsByDay = (day: Date) => {
    return taskEvents.filter(event => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Get events for a specific day and hour
  const getEventForHourAndDay = (day: Date, hour: number) => {
    return getEventsByDay(day).filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getHours() === hour;
    });
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
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

  // Add GMT+7 timezone to mimic the design
  const getTimezoneDisplay = () => {
    return 'GMT+7';
  };

  // Generate all time slots
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header with day names */}
      <div className="flex border-b sticky top-0 bg-white z-10">
        <div className="w-16 text-center border-r pt-2 text-gray-500 text-xs font-medium">
          {getTimezoneDisplay()}
        </div>
        {daysInWeek.map((day, index) => {
          const isCurrentDay = isToday(day);
          const dayNumber = day.getDate();
          
          return (
            <div 
              key={index} 
              className={`flex-1 text-center py-2 ${isCurrentDay ? 'relative' : ''}`}
            >
              <div className={`text-xs font-medium text-gray-500`}>{DAYS_OF_WEEK[day.getDay()]}</div>
              {isCurrentDay ? (
                <>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mt-1">
                    <span className="text-white font-medium">{dayNumber}</span>
                  </div>
                </>
              ) : (
                <div className={`text-lg font-normal text-gray-800 mt-1`}>{dayNumber}</div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Time grid */}
      <div className="flex flex-col relative">
        {hours.map(hour => {
          const isWorkingHour = hour >= WORKING_HOURS_START && hour <= WORKING_HOURS_END;
          const hourHeight = isWorkingHour ? NORMAL_HOURS_HEIGHT : CONDENSED_HOURS_HEIGHT;
          
          return (
            <div 
              key={hour} 
              className="flex"
              style={{ height: `${hourHeight}px` }}
            >
              {/* Time label */}
              <div className="w-16 border-r p-2 text-xs text-gray-500 text-right pr-3">
                {formatHourLabel(hour)}
              </div>
              
              {/* Day columns */}
              {daysInWeek.map((day, dayIndex) => {
                const events = getEventForHourAndDay(day, hour);
                const isCurrentDay = isToday(day);
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`flex-1 border-r relative`}
                  >
                    {/* Horizontal line at the top of each cell */}
                    <div className="absolute top-0 left-0 right-0 border-t border-gray-200"></div>
                    
                    {/* Half-hour indicator */}
                    <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-200 opacity-50"></div>
                    
                    {events.map(event => (
                      <CalendarEvent
                        key={event._id}
                        event={event}
                        onClick={() => handleEditEvent(event)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
        
        {/* Current time indicator */}
        {daysInWeek.some(day => isToday(day)) && (
          <TimeIndicator top={getCurrentTimePosition()} />
        )}
      </div>
    </div>
  );
}; 