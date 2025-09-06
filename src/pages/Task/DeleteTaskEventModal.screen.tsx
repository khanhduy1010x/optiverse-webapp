import React, { useEffect, useState } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import { useTaskEventList } from '../../hooks/task-events/useTaskEventList.hook';
import Modal from 'react-modal';
import { GROUP_CLASSNAMES } from '../../styles';
import { useAppTranslate } from '../../hooks/useAppTranslate';

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
  const { t } = useAppTranslate('task');
  const { deleteTaskEvent, loading, error, setListOperations } = useTaskEventOperations();
  const [deleteOption, setDeleteOption] = useState<'this' | 'following' | 'all'>('this');
  const { taskEvents, refreshTaskEvents } = useTaskEventList(taskEvent?.task_id || '');
  
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
      if (deleteOption === 'all') {
        // Xóa tất cả event cùng series (cùng parent_event_id hoặc cùng repeat_type+title+task_id)
        let eventsToDelete = [];
        if (taskEvent.parent_event_id) {
          eventsToDelete = taskEvents.filter(ev => ev.parent_event_id === taskEvent.parent_event_id || ev._id === taskEvent.parent_event_id);
        } else {
          // fallback: cùng repeat_type, title, task_id
          eventsToDelete = taskEvents.filter(ev => ev.repeat_type === taskEvent.repeat_type && ev.title === taskEvent.title && ev.task_id === taskEvent.task_id);
        }
        for (const ev of eventsToDelete) {
          await deleteTaskEvent(ev._id);
        }
        refreshTaskEvents();
      } else {
        await deleteTaskEvent(taskEvent._id);
        if (removeEvent) removeEvent(taskEvent._id);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  if (!isOpen || !taskEvent) return null;

  const formatEventTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatEventDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <Modal isOpen={isOpen}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[90vw] bg-white rounded-lg shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
      onRequestClose={onClose}
      ariaHideApp={false}
    >
      <div className="p-6">
        <h2 className="text-xl font-medium mb-6">{t('event_delete_recurring_title')}</h2>
        {/* Luôn hiển thị lựa chọn nếu là recurring */}
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
                <span className="text-gray-700">{t('event_delete_only_this')}</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="deleteOption" 
                  checked={deleteOption === 'all'} 
                  onChange={() => setDeleteOption('all')}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">{t('event_delete_all_in_series')}</span>
              </label>
            </div>
            <p className="text-gray-700 mt-4">
              {t('event_delete_confirm_with_datetime', { title: taskEvent.title, date: formatEventDate(taskEvent.start_time), time: formatEventTime(taskEvent.start_time) })}
            </p>
          </div>
        ) : (
          <p className="text-gray-700 mb-6">
            {t('event_delete_confirm_with_datetime', { title: taskEvent.title, date: formatEventDate(taskEvent.start_time), time: formatEventTime(taskEvent.start_time) })}
          </p>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {t('ok')}
          </button>
        </div>
      </div>
    </Modal>
  );
}; 