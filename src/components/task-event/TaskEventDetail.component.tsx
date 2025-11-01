import React from 'react';
import Modal from 'react-modal';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { Tag } from '../../types/task/response/tag.response';
import { format } from 'date-fns';
import { GROUP_CLASSNAMES } from '../../styles';
import TagItem from '../tags/TagItem.component';

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
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
      ariaHideApp={false}
    >
      <div className={GROUP_CLASSNAMES.taskModalContent}>
        {/* Event title */}
        <div className={GROUP_CLASSNAMES.taskDetailHeader}>
          <h2 className="text-xl font-medium text-gray-900">
            {event.title || '(No title)'}
          </h2>
        </div>

        {/* Description */}
        {event.description && (
          <div className={GROUP_CLASSNAMES.taskDetailDescription}>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        <div className={GROUP_CLASSNAMES.taskDetailSection}>
          <div className="space-y-2">
            {/* Date and Time */}
            <div className="flex items-center py-2">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-sm text-gray-700">Date & Time:</div>
              <span className="ml-auto text-sm text-gray-600">
                {formatEventDate()}
              </span>
            </div>

            {/* Repeat Type */}
            {isPartOfSeries && (
              <div className="flex items-center py-2">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div className="text-sm text-gray-700">Repeat:</div>
                <span className="ml-auto text-sm text-gray-600">
                  {getRepeatTypeDisplay()}
                </span>
              </div>
            )}

            {/* Tags Section */}
            {tags && tags.length > 0 && (
              <div className="py-2">
                <div className="flex items-start mb-2">
                  <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div className="text-sm text-gray-700">Tags:</div>
                </div>
                <div className={GROUP_CLASSNAMES.tagContainer}>
                  {tags.map((tag) => (
                    <TagItem
                      key={tag._id || `temp-${tag.name}-${Math.random().toString(36).substr(2, 9)}`}
                      tag={tag}
                      className={GROUP_CLASSNAMES.tagItem}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom buttons */}
        <div className={GROUP_CLASSNAMES.taskDetailFooter}>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={GROUP_CLASSNAMES.taskModalCloseButton}
          aria-label="Close"
          title="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Modal>
  );
}; 