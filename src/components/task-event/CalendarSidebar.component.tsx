import React, { useState } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { MiniCalendar } from './MiniCalendar.component';

interface CalendarSidebarProps {
  showSidebar: boolean;
  handleAddEvent: () => void;
  taskEvents: TaskEvent[];
  handleEditEvent: (event: TaskEvent) => void;
  handleDeleteEvent: (event: TaskEvent) => void;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  showSidebar,
  handleAddEvent,
  taskEvents,
  handleEditEvent,
  handleDeleteEvent
}) => {
  if (!showSidebar) return null;

  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  const [showMiniCalendarPopup, setShowMiniCalendarPopup] = useState(false);
  const handleDateClick = (date: Date) => setMiniCalendarDate(date);

  return (
    <aside className="w-full md:w-72 bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-6 border-r border-gray-100 transition-all duration-300 max-h-[90vh] overflow-y-auto">
      <MiniCalendar
        currentDate={miniCalendarDate}
        miniCalendarDate={miniCalendarDate}
        setMiniCalendarDate={setMiniCalendarDate}
        handleDateClick={handleDateClick}
        setShowMiniCalendarPopup={setShowMiniCalendarPopup}
        showMiniCalendarPopup={showMiniCalendarPopup}
      />
      <div className="font-bold text-xl text-gray-700 mb-2 mt-2">Upcoming events</div>
      <div className="overflow-y-auto flex-1 space-y-2">
        {taskEvents.length === 0 ? (
          <div className="text-base text-gray-500 italic">No events scheduled</div>
        ) : (
          taskEvents.map(event => (
            <div 
              key={event._id} 
              className="rounded-xl px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 transition-all cursor-pointer border-l-4 border-blue-400 shadow group flex flex-col gap-1"
            >
              <div className="font-semibold text-blue-700 text-base truncate group-hover:text-indigo-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
                {event.title || 'Untitled Event'}
              </div>
              <div className="text-xs text-gray-500 group-hover:text-gray-700">
                {new Date(event.start_time).toLocaleString(undefined, { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))
        )}
      </div>
      <button className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all text-base">+ Quick add</button>
    </aside>
  );
}; 