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

  // Xác định xem sự kiện có phải là một phần của chuỗi lặp lại không
  const isPartOfSeries = event.parent_event_id || event.repeat_type !== 'none';

  // Hiển thị loại lặp lại
  const getRepeatTypeDisplay = () => {
    switch (event.repeat_type) {
      case 'daily':
        return 'Hàng ngày';
      case 'weekly':
        return 'Hàng tuần';
      case 'monthly':
        return 'Hàng tháng';
      case 'yearly':
        return 'Hàng năm';
      case 'custom':
        return 'Tùy chỉnh';
      default:
        return event.parent_event_id ? 'Một phần của chuỗi lặp lại' : '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="mb-6">
          <div className="font-bold text-2xl text-gray-900 mb-2">{event.title || '(No title)'}</div>
          <div className="text-base text-gray-600 mb-2">{formatEventDate()}</div>
          {event.description && <div className="text-gray-700 text-sm mb-2">{event.description}</div>}
        </div>
        <div className="flex gap-4 mt-6">
          <button onClick={onEdit} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">Edit</button>
          <button onClick={onDelete} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Delete</button>
        </div>
      </div>
    </div>
  );
}; 