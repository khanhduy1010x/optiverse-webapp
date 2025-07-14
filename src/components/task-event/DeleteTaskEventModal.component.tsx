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
  const [deleteOption, setDeleteOption] = useState<'this' | 'all' | 'future'>('this');
  
  // Check if the event is part of a recurring series
  const isRecurring = taskEvent && (
    taskEvent.repeat_type !== 'none' || 
    taskEvent?.parent_event_id
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
      // Xóa sự kiện hiện tại từ cơ sở dữ liệu
      const success = await deleteTaskEvent(taskEvent._id);
      
      if (success) {
        if (removeEvent) {
          if (deleteOption === 'this') {
            // Chỉ xóa sự kiện hiện tại
            removeEvent(taskEvent._id);
          } else if (deleteOption === 'all' && taskEvent.parent_event_id) {
            // Nếu xóa tất cả các sự kiện trong chuỗi, xóa sự kiện gốc
            removeEvent(taskEvent.parent_event_id);
          } else if (deleteOption === 'all' && taskEvent.repeat_type !== 'none') {
            // Nếu đây là sự kiện gốc và xóa tất cả
            removeEvent(taskEvent._id);
          } else if (deleteOption === 'future') {
            // Xử lý xóa các sự kiện trong tương lai (cần xử lý ở phía backend)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="mb-6">
          <div className="font-bold text-xl text-gray-900 mb-2">Delete Event</div>
          <div className="text-gray-700 text-base mb-4">Are you sure you want to delete this event?</div>
        </div>
        <div className="flex gap-4 mt-6">
          <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Delete</button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
        </div>
      </div>
    </div>
  );
}; 