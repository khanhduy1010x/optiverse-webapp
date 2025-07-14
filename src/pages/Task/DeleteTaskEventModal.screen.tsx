import React, { useEffect, useState } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import Modal from 'react-modal';
import { GROUP_CLASSNAMES } from '../../styles';

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
  const [deleteOption, setDeleteOption] = useState<'this' | 'following' | 'all'>('this');
  
  // Check if the event is part of a recurring series
  const isRecurring = taskEvent && (
    taskEvent.repeat_type !== 'none' || 
    taskEvent?.parent_event_id
  );

  useEffect(() => {
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
      // Delete the current event from the database
      const success = await deleteTaskEvent(taskEvent._id);
      
      if (success) {
        if (removeEvent) {
          if (deleteOption === 'this') {
            // Only delete this event
            removeEvent(taskEvent._id);
          } else if (deleteOption === 'all' && taskEvent.parent_event_id) {
            // If deleting all events in the series, delete the parent event
            removeEvent(taskEvent.parent_event_id);
          } else if (deleteOption === 'all' && taskEvent.repeat_type !== 'none') {
            // If this is the parent event and deleting all
            removeEvent(taskEvent._id);
          } else if (deleteOption === 'following') {
            // Handle deleting this and following events (would need backend support)
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

  const formatEventTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatEventDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <Modal isOpen={isOpen}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[90vw] bg-white rounded-lg shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
      onRequestClose={onClose}
      ariaHideApp={false}
    >
      <div className="p-6">
        <h2 className="text-xl font-medium mb-6">Delete recurring event</h2>
        
        {isRecurring ? (
          <div className="mb-6">
            <div className="mb-4">
              <label className="flex items-center space-x-3 mb-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="deleteOption" 
                  checked={deleteOption === 'this'} 
                  onChange={() => setDeleteOption('this')}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">This event</span>
              </label>
              
              <label className="flex items-center space-x-3 mb-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="deleteOption" 
                  checked={deleteOption === 'following'} 
                  onChange={() => setDeleteOption('following')}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">This and following events</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="deleteOption" 
                  checked={deleteOption === 'all'} 
                  onChange={() => setDeleteOption('all')}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">All events</span>
              </label>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this event: 
            <span className="font-medium block mt-2">{taskEvent.title}</span>
            on <span className="font-medium">{formatEventDate(taskEvent.start_time)}</span> at <span className="font-medium">{formatEventTime(taskEvent.start_time)}</span>?
          </p>
        )}
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
}; 