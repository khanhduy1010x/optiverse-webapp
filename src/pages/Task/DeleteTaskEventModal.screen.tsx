import React, { useEffect } from 'react';
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
    <Modal isOpen={isOpen}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
      onRequestClose={onClose}
    >
      <div className={GROUP_CLASSNAMES.taskModalContent}>
        <div className={GROUP_CLASSNAMES.taskDetailHeader}>
          <h2 className="text-xl font-medium mb-2">Delete Event</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this event:
            <span className="font-medium block mt-2 text-gray-900">{taskEvent.title}</span>
            scheduled for{' '}
            <span className="font-medium">{formatDate(taskEvent.start_time)}</span>?
          </p>
          
          <p className="text-sm text-gray-500">
            This action cannot be undone.
          </p>
          
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
        
        <div className={GROUP_CLASSNAMES.taskModalFooter}>
          <button
            type="button"
            onClick={onClose}
            className={GROUP_CLASSNAMES.buttonSecondary + " px-4 py-2 text-sm"}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 text-sm font-medium transition-colors"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}; 