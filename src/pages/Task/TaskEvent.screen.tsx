import React, { useState, useEffect } from 'react';
import { useTaskEventList } from '../../hooks/task-events/useTaskEventList.hook';
import { TaskEvent as TaskEventType } from '../../types/task-events/task-events.types';
import { TaskEventModal } from './TaskEventModal.screen';
import { DeleteTaskEventModal } from './DeleteTaskEventModal.screen';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const VIEW_TYPES = ['Day', 'Week', 'Month', 'Year'] as const;
type ViewType = typeof VIEW_TYPES[number];

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  taskId: string;
  repeatType?: string;
}

const TaskEvent: React.FC = () => {
  // In a real implementation, this would come from props or params
  // For demo purposes, using a mock task ID that will trigger our mock data
  const taskId = "mock-task-1";

  const { taskEvents, loading, error, refreshTaskEvents } = useTaskEventList(taskId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TaskEventType | undefined>(undefined);
  const [eventToDelete, setEventToDelete] = useState<TaskEventType | null>(null);
  const [viewType, setViewType] = useState<ViewType>('Week');
  const [showSidebar, setShowSidebar] = useState(true);
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Convert task events to calendar events
  useEffect(() => {
    if (taskEvents && taskEvents.length > 0) {
      const events = taskEvents.map(event => ({
        id: event._id,
        title: `Task Event`,
        start: new Date(event.start_time),
        end: event.end_time ? new Date(event.end_time) : new Date(new Date(event.start_time).getTime() + 60 * 60 * 1000),
        taskId: event.task_id,
        repeatType: event.repeat_type
      }));
      setCalendarEvents(events);
    } else {
      // Set empty array if no events
      setCalendarEvents([]);
    }
  }, [taskEvents]);
  
  // Update current time every minute for the time indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const getDaysInWeek = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

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

  const daysInWeek = getDaysInWeek();
  const daysInMonth = getDaysInMonth();

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'Day') {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (viewType === 'Week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else if (viewType === 'Month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (viewType === 'Year') {
      newDate.setFullYear(currentDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'Day') {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (viewType === 'Week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else if (viewType === 'Month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (viewType === 'Year') {
      newDate.setFullYear(currentDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = (date?: Date, hour?: number) => {
    setSelectedEvent(undefined);
    
    // If a specific date and hour are provided, create a pre-filled event
    if (date && hour !== undefined) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      
      // Create a temporary event object with the selected time
      const tempEvent: Partial<TaskEventType> = {
        task_id: taskId,
        start_time: startTime,
        repeat_type: 'none'
      };
      
      setSelectedEvent(tempEvent as TaskEventType);
    }
    
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: TaskEventType) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (event: TaskEventType) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear();
  };

  const getEventsByDay = (day: Date) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear();
    });
  };

  const getEventForHour = (day: Date, hour: number) => {
    return calendarEvents.find(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear() &&
        eventDate.getHours() === hour;
    });
  };

  const getOriginalTaskEvent = (id: string): TaskEventType | undefined => {
    return taskEvents.find(event => event._id === id);
  };

  const generateTimeSlots = () => {
    return HOURS.map((hour) => {
      const formattedHour = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      return (
        <div key={hour} className="h-20 border-b px-2 py-1 text-right text-gray-500 text-sm">
          {formattedHour}
        </div>
      );
    });
  };

  const generateMiniCalendar = () => {
    const year = miniCalendarDate.getFullYear();
    const month = miniCalendarDate.getMonth();
    
    // Get days for mini calendar
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay());
    
    const days = [];
    let currentDay = new Date(startDay);
    
    // Generate 6 weeks of days
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    const weeks = [];
    for (let i = 0; i < 6; i++) {
      weeks.push(days.slice(i * 7, (i + 1) * 7));
    }
    
    const handlePrevMonth = () => {
      const newDate = new Date(miniCalendarDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setMiniCalendarDate(newDate);
    };
    
    const handleNextMonth = () => {
      const newDate = new Date(miniCalendarDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setMiniCalendarDate(newDate);
    };
    
    const handleDateClick = (date: Date) => {
      setCurrentDate(date);
    };
    
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">
            {miniCalendarDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <div className="flex space-x-1">
            <button 
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((day, dayIndex) => {
                const isCurrentMonth = day.getMonth() === miniCalendarDate.getMonth();
                const isSelected = day.getDate() === currentDate.getDate() && 
                                  day.getMonth() === currentDate.getMonth() && 
                                  day.getFullYear() === currentDate.getFullYear();
                const isTodayDate = isToday(day);
                
                return (
                  <button 
                    key={dayIndex}
                    onClick={() => handleDateClick(day)}
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs
                      ${isSelected ? 'bg-blue-500 text-white' : ''}
                      ${isTodayDate && !isSelected ? 'border border-blue-500' : ''}
                      ${!isCurrentMonth ? 'text-gray-300' : ''}
                    `}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const isCurrentDay = isToday(currentDate);
    
    return (
      <div className="grid grid-cols-2 h-full border-b">
        {/* Time column */}
        <div className="border-r">
          <div className="h-16 border-b"></div> {/* Empty cell for header */}
          {generateTimeSlots()}
        </div>

        {/* Day column */}
        <div className="border-r">
          {/* Day header */}
          <div className={`h-16 border-b flex flex-col items-center justify-center ${isCurrentDay ? 'bg-blue-500 text-white' : ''}`}>
            <div className="text-sm font-medium">{DAYS_OF_WEEK[currentDate.getDay()]}</div>
            <div className={`text-2xl font-bold ${isCurrentDay ? 'text-white' : ''}`}>{currentDate.getDate()}</div>
          </div>

          {/* Hour cells */}
          {HOURS.map((hour) => {
            const event = getEventForHour(currentDate, hour);
            return (
              <div 
                key={hour} 
                className="h-20 border-b relative"
                onClick={() => handleAddEvent(currentDate, hour)}
              >
                {/* Current time indicator */}
                {isCurrentDay && hour === currentHour && (
                  <div 
                    className="absolute left-0 right-0 z-10 border-t-2 border-red-500"
                    style={{ 
                      top: `${currentMinute / 60 * 100}%`,
                    }}
                  >
                    <div className="absolute -left-1 -top-2 w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                )}
                
                {event && (
                  <div 
                    className="absolute inset-1 bg-blue-100 border border-blue-300 rounded p-1 overflow-hidden cursor-pointer z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEvent(getOriginalTaskEvent(event.id)!);
                    }}
                  >
                    <div className="text-xs font-medium">{event.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      {event.end && ` - ${new Date(event.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                    <button 
                      className="absolute top-1 right-1 text-red-500 text-xs hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(getOriginalTaskEvent(event.id)!);
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Get the current hour for time indicator
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    // Calculate position as percentage of the hour
    return (hours + minutes / 60) * 20; // 20px per hour
  };

  const renderWeekView = () => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const timePosition = getCurrentTimePosition();
    
    return (
      <div className="grid grid-cols-8 h-full border-b">
        {/* Time column */}
        <div className="border-r">
          <div className="h-16 border-b"></div> {/* Empty cell for header */}
          {generateTimeSlots()}
        </div>

        {/* Days columns */}
        {daysInWeek.map((day, index) => {
          const isCurrentDay = isToday(day);
          
          return (
            <div key={index} className="border-r">
              {/* Day header */}
              <div className={`h-16 border-b flex flex-col items-center justify-center ${isCurrentDay ? 'bg-blue-500 text-white' : ''}`}>
                <div className="text-sm font-medium">{DAYS_OF_WEEK[day.getDay()]}</div>
                <div className={`text-2xl font-bold ${isCurrentDay ? 'text-white' : ''}`}>{day.getDate()}</div>
              </div>

              {/* Hour cells */}
              {HOURS.map((hour) => {
                const event = getEventForHour(day, hour);
                return (
                  <div 
                    key={hour} 
                    className="h-20 border-b relative"
                    onClick={() => handleAddEvent(day, hour)}
                  >
                    {/* Current time indicator */}
                    {isCurrentDay && hour === currentHour && (
                      <div 
                        className="absolute left-0 right-0 z-10 border-t-2 border-red-500"
                        style={{ 
                          top: `${currentMinute / 60 * 100}%`,
                        }}
                      >
                        <div className="absolute -left-1 -top-2 w-3 h-3 rounded-full bg-red-500"></div>
                      </div>
                    )}
                    
                    {event && (
                      <div 
                        className="absolute inset-1 bg-blue-100 border border-blue-300 rounded p-1 overflow-hidden cursor-pointer z-20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(getOriginalTaskEvent(event.id)!);
                        }}
                      >
                        <div className="text-xs font-medium">{event.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(event.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {event.end && ` - ${new Date(event.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                        </div>
                        <button 
                          className="absolute top-1 right-1 text-red-500 text-xs hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(getOriginalTaskEvent(event.id)!);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const weeks = [];
    for (let i = 0; i < daysInMonth.length; i += 7) {
      weeks.push(daysInMonth.slice(i, i + 7));
    }

    return (
      <div className="h-full border-b">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b">
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={index} className="py-2 text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-rows-6 h-full">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b">
              {week.map((day, dayIndex) => {
                const dayEvents = getEventsByDay(day);
                const isCurrentMonth = isSameMonth(day);
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`border-r p-1 ${isToday(day) ? 'bg-blue-50' : ''} ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
                    onClick={() => handleAddEvent(day)}
                  >
                    <div className={`text-right ${isToday(day) ? 'font-bold text-blue-500' : ''} ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                      {day.getDate()}
                    </div>
                    
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div 
                          key={event.id}
                          className="bg-blue-100 border border-blue-300 rounded px-1 py-0.5 text-xs truncate cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(getOriginalTaskEvent(event.id)!);
                          }}
                        >
                          {new Date(event.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} {event.title}
                        </div>
                      ))}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
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

  const renderCalendarView = () => {
    switch (viewType) {
      case 'Day':
        return renderDayView();
      case 'Week':
        return renderWeekView();
      case 'Month':
        return renderMonthView();
      case 'Year':
        // Year view could be implemented similarly
        return <div className="p-4">Year view not implemented yet</div>;
      default:
        return renderWeekView();
    }
  };

  const getViewTitle = () => {
    switch (viewType) {
      case 'Day':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      case 'Week':
        const weekStart = new Date(startOfWeek);
        const weekEnd = new Date(startOfWeek);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.toLocaleDateString('en-US', { month: 'long' })} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
          return `${weekStart.toLocaleDateString('en-US', { month: 'short' })} ${weekStart.getDate()} - ${weekEnd.toLocaleDateString('en-US', { month: 'short' })} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        } else {
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
      case 'Month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'Year':
        return currentDate.getFullYear().toString();
      default:
        return formatMonth(currentDate);
    }
  };

  // Show a more user-friendly loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-600">Loading calendar...</p>
      </div>
    );
  }
  
  // Show error with retry option
  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={refreshTaskEvents}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 border-r p-4 bg-white flex flex-col">
          <button 
            onClick={() => handleAddEvent()}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Create
          </button>
          
          {/* Mini Calendar */}
          {generateMiniCalendar()}
          
          {/* My Calendars */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">My Calendars</h3>
            <div className="space-y-1">
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Task Events</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h1 className="text-xl font-bold">Calendar</h1>
            
            <button 
              onClick={handleToday}
              className="px-4 py-1 bg-white border rounded-md hover:bg-gray-50"
            >
              Today
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrevious}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={handleNext}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <span className="text-xl">{getViewTitle()}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {VIEW_TYPES.map((type) => (
              <button 
                key={type}
                onClick={() => setViewType(type)}
                className={`px-3 py-1 rounded ${viewType === type ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar View */}
        <div className="flex-1 overflow-auto bg-white">
          {renderCalendarView()}
        </div>
      </div>

      {/* Modals */}
      <TaskEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={taskId}
        taskEvent={selectedEvent}
        onSuccess={refreshTaskEvents}
      />

      <DeleteTaskEventModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        taskEvent={eventToDelete}
        onSuccess={refreshTaskEvents}
      />
    </div>
  );
};

export default TaskEvent; 