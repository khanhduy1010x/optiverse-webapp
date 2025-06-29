import React, { useState } from 'react';
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
  const [deleteOption, setDeleteOption] = useState<'this' | 'all'>('this');
  
  // Check if the event is part of a recurring series
  const isRecurring = taskEvent && (
    taskEvent.repeat_type !== 'none' || 
    (taskEvent.isRecurrence || taskEvent?._id.toString().includes('-recurrence-'))
  );

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
    
    try {
      const success = await deleteTaskEvent(taskEvent._id);
      if (success) {
        if (removeEvent) {
          if (deleteOption === 'all' && isRecurring) {
            // If deleting all occurrences, extract the original event ID
            const originalId = taskEvent._id.toString().includes('-recurrence-') 
              ? taskEvent._id.toString().split('-recurrence-')[0] 
              : taskEvent._id;
            
            // Call removeEvent with the original ID to remove all occurrences
            removeEvent(originalId);
          } else {
            // Just remove this specific event
            removeEvent(taskEvent._id);
          }
        }
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  if (!isOpen || !taskEvent) return null;

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString([], { day: 'numeric', month: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Delete Event</h2>
          <p className="text-sm text-gray-500 mt-1">
            Bạn có chắc là bạn muốn xóa sự kiện này?
          </p>
        </div>
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this event? This action cannot be undone.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="font-medium">{taskEvent.title || 'Untitled Event'}</div>
            <div className="text-sm text-gray-500">
              {formatDate(taskEvent.start_time)}
              <div>
                {formatTime(taskEvent.start_time)}
                {taskEvent.end_time && ` - ${formatTime(taskEvent.end_time)}`}
              </div>
            </div>
          </div>
          
          {isRecurring && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Delete options:</p>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deleteOption"
                    checked={deleteOption === 'this'}
                    onChange={() => setDeleteOption('this')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Delete this event only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deleteOption"
                    checked={deleteOption === 'all'}
                    onChange={() => setDeleteOption('all')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Delete all recurring events in the series</span>
                </label>
              </div>
            </div>
          )}
          
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