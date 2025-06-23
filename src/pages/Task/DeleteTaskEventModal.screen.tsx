import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';

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
  onSuccess,
}) => {
  const { deleteTaskEvent, loading, error } = useTaskEventOperations();

  const handleDelete = async () => {
    if (!taskEvent) return;
    
    const success = await deleteTaskEvent(taskEvent._id);
    if (success) {
      onSuccess();
      onClose();
    }
  };

  if (!isOpen || !taskEvent) return null;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Delete Task Event</h2>
        
        <p className="mb-4">
          Are you sure you want to delete this task event scheduled for{' '}
          <span className="font-medium">{formatDate(taskEvent.start_time)}</span>?
        </p>
        
        <p className="text-sm text-gray-600 mb-6">
          This action cannot be undone.
        </p>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-red-300"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}; 