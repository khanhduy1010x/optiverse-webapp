import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { TaskEventModal } from '../../pages/Task/TaskEventModal.screen';

interface CreateTaskEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskEvent?: TaskEvent;
  onSuccess: () => void;
  addEvent?: (event: TaskEvent) => void;
  updateEvent?: (eventId: string, event: TaskEvent) => void;
}

export const CreateTaskEventModal: React.FC<CreateTaskEventModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskEvent,
  onSuccess,
  addEvent,
  updateEvent
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="mb-6">
          <div className="font-bold text-2xl text-gray-900 mb-4">Create Event</div>
          {/* Các input cho title, time, description... */}
          {/* ... */}
        </div>
        <div className="flex gap-4 mt-6">
          <button onClick={onSave} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">Save</button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
        </div>
      </div>
    </div>
  );
}; 