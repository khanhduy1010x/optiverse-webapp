import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { format } from 'date-fns';

interface TaskEventDetailProps {
  event: TaskEvent;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskEventDetail: React.FC<TaskEventDetailProps> = ({ 
  event, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen) return null;

  // Format date and time
  const formatEventDate = () => {
    if (!event.start_time) return '';
    
    const startDate = new Date(event.start_time);
    const endDate = event.end_time ? new Date(event.end_time) : null;
    
    const dateStr = format(startDate, 'EEEE, d MMMM');
    
    if (!endDate) return dateStr;
    
    const startTimeStr = format(startDate, 'h:mm');
    const startAmPm = format(startDate, 'a').toLowerCase();
    
    const endTimeStr = format(endDate, 'h:mm');
    const endAmPm = format(endDate, 'a').toLowerCase();
    
    return `${dateStr} · ${startTimeStr} – ${endTimeStr}${endAmPm}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-lg overflow-hidden shadow-xl">
        {/* Header with action buttons */}
        <div className="flex justify-end space-x-1 p-2 border-b">
          <button 
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Event content */}
        <div className="p-5">
          {/* Color indicator and title */}
          <div className="flex items-start mb-4">
            <div className="w-5 h-5 rounded-full bg-blue-500 mr-3 mt-1 flex-shrink-0"></div>
            <h2 className="text-xl font-semibold">{event.title}</h2>
          </div>
          
          {/* Date and time */}
          <div className="flex items-center mb-4 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatEventDate()}</span>
          </div>
          
          {/* Take meeting notes */}
          <div className="flex items-start mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <div className="text-blue-500 font-medium">Take meeting notes</div>
              <div className="text-gray-500 text-sm">Start a new document to capture notes</div>
            </div>
          </div>
          
          {/* Notification */}
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-gray-700">10 minutes before</span>
          </div>
          
          {/* Description if available */}
          {event.description && (
            <div className="mt-4 text-gray-700">
              <p>{event.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 