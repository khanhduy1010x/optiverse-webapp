import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';

interface DeleteTaskEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskEvent: TaskEvent | null;
  onSuccess: () => void;
}

export const DeleteTaskEventModal: React.FC<DeleteTaskEventModalProps> = ({
  isOpen,
  onClose,
  taskEvent,
  onSuccess
}) => {
  if (!isOpen || !taskEvent) return null;

  const handleDelete = async () => {
    try {
      // Implement delete logic here
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting task event:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Delete Event</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-600">
            Are you sure you want to delete this event? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end space-x-2 p-4 border-t">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}; 