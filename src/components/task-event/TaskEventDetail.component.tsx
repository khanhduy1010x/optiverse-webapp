import React from 'react';
import Modal from 'react-modal';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { Tag } from '../../types/task/response/tag.response';
import { format } from 'date-fns';
import { GROUP_CLASSNAMES } from '../../styles';

interface TaskEventDetailProps {
  event: TaskEvent;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  tags?: Tag[];
}

export const TaskEventDetail: React.FC<TaskEventDetailProps> = ({ 
  event, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  tags = []
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
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      case 'custom':
        return 'Custom';
      default:
        return event.parent_event_id ? 'Một phần của chuỗi lặp lại' : '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative outline-none border border-gray-100"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center min-h-screen"
      ariaHideApp={false}
    >
      <button 
        type="button"
        onClick={onClose}
        title="Close"
        aria-label="Close"
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition"
      >
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 mb-3 shadow">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <div className="font-extrabold text-2xl text-gray-900 mb-1 truncate max-w-full">{event.title || '(No title)'}</div>
        <div className="text-base text-gray-600 mb-1 flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {formatEventDate()}
        </div>
        {isPartOfSeries && (
          <div className="text-xs text-purple-500 font-semibold mb-1">{getRepeatTypeDisplay()}</div>
        )}
        {event.description && <div className="text-gray-700 text-sm mt-2 mb-1 px-2 break-words">{event.description}</div>}
      </div>

      {/* Tags Section */}
      {tags && tags.length > 0 && (
        <div className="w-full mt-6 px-2">
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.map((tag) => (
              <span
                key={tag._id || `temp-${tag.name}-${Math.random().toString(36).substr(2, 9)}`}
                className={GROUP_CLASSNAMES.tagItem}
                style={{
                  backgroundColor: tag.color ? `${tag.color}15` : '#e5e7eb15',
                  color: tag.color || '#6b7280'
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <button 
          type="button"
          onClick={onEdit}
          title="Edit event"
          aria-label="Edit event"
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold shadow hover:scale-105 hover:shadow-lg transition-all text-base"
        >
          Edit
        </button>
        <button 
          type="button"
          onClick={onDelete}
          title="Delete event"
          aria-label="Delete event"
          className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-bold shadow hover:scale-105 hover:shadow-lg transition-all text-base"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}; 