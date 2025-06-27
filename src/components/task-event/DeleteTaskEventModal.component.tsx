import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';

interface DeleteTaskEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskEvent: TaskEvent | null;
  onSuccess: () => void;
  removeEvent?: (eventId: string) => void;
}

export const DeleteTaskEventModal: React.FC<DeleteTaskEventModalProps> = ({
  isOpen,
  onClose,
  taskEvent,
  onSuccess,
  removeEvent
}) => {
  const { deleteTaskEvent, loading, error, setListOperations } = useTaskEventOperations();

  React.useEffect(() => {
    if (removeEvent) {
      setListOperations(
        () => {},
        removeEvent,
        () => {}
      );
    }
  }, [removeEvent, setListOperations]);

  const handleDelete = async () => {
    if (!taskEvent) return;
    
    const success = await deleteTaskEvent(taskEvent._id);
    if (success) {
      if (removeEvent) {
        removeEvent(taskEvent._id);
      }
      onSuccess();
      onClose();
    }
  };

  if (!isOpen || !taskEvent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Delete Event</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this event? This action cannot be undone.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="font-medium">{taskEvent.title || 'Untitled Event'}</div>
            <div className="text-sm text-gray-500">
              {new Date(taskEvent.start_time).toLocaleString()}
              {taskEvent.end_time && ` - ${new Date(taskEvent.end_time).toLocaleString()}`}
            </div>
          </div>
          
          {error && (
            <div className="mt-4 text-red-500 text-sm">{error}</div>
          )}
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
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}; 