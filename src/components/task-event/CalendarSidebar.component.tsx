import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';

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

  return (
    <div className="w-64 border-r p-4 bg-white flex flex-col shadow-sm">
      <button
        onClick={handleAddEvent}
        className="px-4 py-1.5 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 flex items-center justify-center transition-colors mb-4"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Event
      </button>
      
      <div className="text-sm font-medium text-gray-700 mb-2">Upcoming Events</div>
      
      <div className="overflow-y-auto flex-1 space-y-2">
        {taskEvents.length === 0 ? (
          <div className="text-sm text-gray-500 italic">No events scheduled</div>
        ) : (
          taskEvents.map(event => (
            <div 
              key={event._id} 
              className="border border-gray-200 rounded-md p-2 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="font-medium text-sm truncate">{event.title || 'Untitled Event'}</div>
              <div className="text-xs text-gray-500">
                {new Date(event.start_time).toLocaleString(undefined, { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="flex mt-1 justify-end space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditEvent(event);
                  }}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(event);
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 