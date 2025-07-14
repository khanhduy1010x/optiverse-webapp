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
    <aside className="w-72 bg-white rounded-l-2xl shadow-sm p-6 flex flex-col gap-6 border-r">
      <MiniCalendar
        currentDate={miniCalendarDate}
        miniCalendarDate={miniCalendarDate}
        setMiniCalendarDate={setMiniCalendarDate}
        handleDateClick={handleDateClick}
        setShowMiniCalendarPopup={setShowMiniCalendarPopup}
        showMiniCalendarPopup={showMiniCalendarPopup}
      />
      <div className="font-semibold text-lg text-gray-700 mb-2">Upcoming events</div>
      <div className="overflow-y-auto flex-1 space-y-2">
        {taskEvents.length === 0 ? (
          <div className="text-sm text-gray-500 italic">No events scheduled</div>
        ) : (
          taskEvents.map(event => (
            <div 
              key={event._id} 
              className="rounded-lg px-4 py-2 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border-l-4 border-blue-400"
            >
              <div className="font-bold text-blue-700 text-sm truncate">{event.title || 'Untitled Event'}</div>
              <div className="text-xs text-gray-500">
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
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 shadow">+ Quick add</button>
    </aside>
  );
}; 