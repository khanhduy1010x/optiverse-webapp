import React, { useState, useEffect } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { useTaskEventList } from '../../hooks/task-events/useTaskEventList.hook';
import { TaskEventModal } from './TaskEventModal.screen';
import { DeleteTaskEventModal } from './DeleteTaskEventModal.screen';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface TaskEventListProps {
  taskId: string;
}

export const TaskEventList: React.FC<TaskEventListProps> = ({ taskId }) => {
  const { t } = useAppTranslate('task');
  const { taskEvents, loading, error, refreshTaskEvents } = useTaskEventList(taskId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskEvent, setSelectedTaskEvent] = useState<TaskEvent | undefined>(undefined);
  const [taskEventToDelete, setTaskEventToDelete] = useState<TaskEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<TaskEvent | null>(null);

  // Get current date for the week view
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  
  // Generate days of the week
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
  
  // Time slots from 1 AM to 9 AM
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 1);

  const handleAddEvent = () => {
    setSelectedTaskEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEditEvent = (taskEvent: TaskEvent) => {
    setSelectedTaskEvent(taskEvent);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (taskEvent: TaskEvent) => {
    setTaskEventToDelete(taskEvent);
    setIsDeleteModalOpen(true);
  };

  const handleViewEventDetail = (taskEvent: TaskEvent) => {
    setSelectedEventDetail(taskEvent);
    setIsEventDetailOpen(true);
  };

  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };
  
  const formatDayName = (date: Date) => {
    const days = [
      t('day_sun'), t('day_mon'), t('day_tue'), t('day_wed'), t('day_thu'), t('day_fri'), t('day_sat')
    ];
    return days[date.getDay()];
  };

  // Function to check if an event belongs to a specific day and time slot
  const getEventsForDayAndTime = (day: Date, hour: number) => {
    if (!taskEvents) return [];
    
    return taskEvents.filter(event => {
      const eventDate = new Date(event.start_time);
      const eventHour = eventDate.getHours();
      const eventDay = eventDate.getDay();
      
      return eventDay === day.getDay() && eventHour === hour;
    });
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Event detail modal
  const EventDetailModal = () => {
    if (!selectedEventDetail) return null;
    
    const formatEventTime = (date: Date | string) => {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 relative">
          <button 
            onClick={() => setIsEventDetailOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold">{selectedEventDetail.title}</h3>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700">
              {formatEventTime(selectedEventDetail.start_time)}
              {selectedEventDetail.end_time && ` - ${formatEventTime(selectedEventDetail.end_time)}`}
            </p>
            <p className="text-gray-500 text-sm">
              {new Date(selectedEventDetail.start_time).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          {selectedEventDetail.description && (
            <div className="mb-4">
              <p className="text-gray-700">{selectedEventDetail.description}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => {
                setIsEventDetailOpen(false);
                handleDeleteEvent(selectedEventDetail);
              }}
              className="px-4 py-2 text-red-500 hover:bg-red-50 rounded"
            >
              {t('delete')}
            </button>
            <button
              onClick={() => {
                setIsEventDetailOpen(false);
                handleEditEvent(selectedEventDetail);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t('edit')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-4">{t('loading_task_events')}</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t('schedules_title')}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToday}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
          >
            {t('today')}
          </button>
          <button
            onClick={handlePrevWeek}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-lg font-medium">
            {startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={handleAddEvent}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            {t('add_schedule')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Calendar Header */}
          <div className="flex border-b">
            <div className="w-20 flex-shrink-0"></div>
            {daysOfWeek.map((day, index) => (
              <div key={index} className="flex-1 text-center p-2">
                <div className="font-medium">{formatDayName(day)}</div>
                <div className={`text-2xl ${day.getDate() === today.getDate() && day.getMonth() === today.getMonth() ? 'bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto' : ''}`}>
                  {formatDate(day)}
                </div>
              </div>
            ))}
          </div>
          
          {/* Time zone indicator */}
          <div className="flex border-b py-1">
            <div className="w-20 flex-shrink-0 text-xs text-gray-500 pl-2">{t('timezone_gmt7')}</div>
            <div className="flex-1"></div>
          </div>
          
          {/* Time slots and events */}
          {timeSlots.map((hour) => (
            <div key={hour} className="flex border-b">
              <div className="w-20 flex-shrink-0 py-4 text-right pr-2 text-sm">
                {hour} {t('am')}
              </div>
              
              {daysOfWeek.map((day, dayIndex) => {
                const events = getEventsForDayAndTime(day, hour);
                return (
                  <div key={dayIndex} className="flex-1 border-l p-1 min-h-[60px]">
                    {events.map((event, eventIndex) => (
                      <div 
                        key={eventIndex}
                        className="bg-blue-400 text-white p-1 rounded text-sm mb-1 cursor-pointer"
                        onClick={() => handleViewEventDetail(event)}
                      >
                        <div className="font-medium">{event.title || t('no_title')}</div>
                        <div className="text-xs">
                          {new Date(event.start_time).getHours()}:00 - 
                          {event.end_time ? new Date(event.end_time).getHours() : (new Date(event.start_time).getHours() + 1)}:00
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <TaskEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={taskId}
        taskEvent={selectedTaskEvent}
        onSuccess={refreshTaskEvents}
      />

      <DeleteTaskEventModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        taskEvent={taskEventToDelete}
        onSuccess={refreshTaskEvents}
      />

      {isEventDetailOpen && <EventDetailModal />}
    </div>
  );
}; 