import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';

interface MonthViewProps {
  currentDate: Date;
  taskEvents: TaskEvent[];
  handleAddEvent: (date?: Date, hour?: number) => void;
  handleEditEvent: (event: TaskEvent) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  taskEvents,
  handleAddEvent,
  handleEditEvent
}) => {
  // Get days in the month with padding for full weeks
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the first day of the week containing the first day of the month
    const start = new Date(firstDay);
    start.setDate(start.getDate() - start.getDay());
    
    // Get the last day of the week containing the last day of the month
    const end = new Date(lastDay);
    const daysToAdd = 6 - end.getDay();
    end.setDate(end.getDate() + daysToAdd);
    
    const days = [];
    let current = new Date(start);
    
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const daysInMonth = getDaysInMonth();

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

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date is in the current month
  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Format event time
  const formatEventTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Weeks are always 6 rows max in a month view
  const weekRows = [];
  for (let i = 0; i < daysInMonth.length; i += 7) {
    weekRows.push(daysInMonth.slice(i, i + 7));
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Days of week header */}
      <div className="grid grid-cols-7 text-center font-medium text-gray-600 bg-white sticky top-0 z-10 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="py-2">{day}</div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="flex-1">
        {weekRows.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b">
            {week.map((day, dayIndex) => {
              const events = getEventsByDay(day);
              const dayClasses = `min-h-[100px] border-r relative p-1 ${
                isToday(day) ? 'bg-blue-50' : 
                !isSameMonth(day) ? 'bg-gray-100 text-gray-400' : 'bg-white'
              }`;
              
              return (
                <div 
                  key={dayIndex} 
                  className={dayClasses}
                >
                  <div className={`text-right p-1 ${isToday(day) ? 'bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center ml-auto' : ''}`}>
                    {day.getDate()}
                  </div>
                  
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                    {events.slice(0, 3).map((event) => (
                      <div
                        key={event._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        className="text-xs bg-blue-100 p-1 rounded truncate cursor-pointer hover:bg-blue-200"
                      >
                        <span className="font-medium">{formatEventTime(event.start_time)}</span>
                        {' '}
                        {event.title || 'Untitled'}
                      </div>
                    ))}
                    
                    {events.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        + {events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}; 