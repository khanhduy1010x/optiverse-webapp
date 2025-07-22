import React, { useState } from 'react';
import Modal from 'react-modal';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { useTaskEventForm } from '../../hooks/task-events/useTaskEventForm.hook';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import { useTaskEventList } from '../../hooks/task-events/useTaskEventList.hook';

interface UpdateTaskEventModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskEvent: TaskEvent;
  onSuccess: () => void;
  updateEvent?: (eventId: string, event: TaskEvent) => void;
}

export const UpdateTaskEventModalForm: React.FC<UpdateTaskEventModalFormProps> = ({
  isOpen,
  onClose,
  taskId,
  taskEvent,
  onSuccess,
  updateEvent
}) => {
  const { formData, handleInputChange, resetForm, getUpdatePayload } = useTaskEventForm(taskEvent);
  const { updateTaskEvent, loading } = useTaskEventOperations();
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);
  const [selectedColor, setSelectedColor] = useState(taskEvent.color || '#3B82F6');
  const [titleError, setTitleError] = useState('');
  const [descError, setDescError] = useState('');
  const [updateOption, setUpdateOption] = useState<'this' | 'all'>('this');
  const { taskEvents, refreshTaskEvents } = useTaskEventList(taskId);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);

  // Chuẩn bị payload dùng chung cho cả submit và confirm
  const buildPayload = () => {
    const payload = getUpdatePayload();
    payload.title = formData.title.trim();
    payload.start_time = (formData.start_time instanceof Date)
      ? formData.start_time.toISOString()
      : new Date(formData.start_time).toISOString();
    payload.end_time = formData.end_time
      ? (formData.end_time instanceof Date ? formData.end_time.toISOString() : new Date(formData.end_time).toISOString())
      : undefined;
    payload.description = [
      (formData.guests?.join(', ') || '').trim(),
      (formData.location || '').trim(),
      (formData.description || '').trim()
    ].filter(Boolean).join('\n');
    payload.guests = Array.isArray(formData.guests) ? formData.guests.filter(g => !!g && g.trim()) : [];
    payload.location = formData.location || '';
    payload.color = selectedColor || '#3B82F6';
    if ((payload.repeat_type === 'weekly' || payload.repeat_type === 'custom') && 
        (!payload.repeat_days || payload.repeat_days.length === 0)) {
      payload.repeat_days = [new Date(formData.start_time).getDay()];
    }
    if (payload.repeat_end_type === undefined) payload.repeat_end_type = 'never';
    if (payload.repeat_interval === undefined) payload.repeat_interval = 1;
    if (payload.repeat_end_type === 'on' && !payload.repeat_end_date) {
      const defaultEndDate = new Date(formData.start_time);
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 3);
      payload.repeat_end_date = defaultEndDate.toISOString();
    } else if (payload.repeat_end_type === 'after' && !payload.repeat_occurrences) {
      payload.repeat_occurrences = 10;
    }
    return payload;
  };

  React.useEffect(() => {
    setTitleError(formData.title && formData.title.length > 50 ? 'Title must not exceed 50 characters.' : '');
    setDescError(formData.description && formData.description.length > 100 ? 'Description must not exceed 100 characters.' : '');
  }, [formData.title, formData.description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      alert('Title is required.');
      return;
    }
    if (formData.title.length > 50) {
      alert('Title must not exceed 50 characters.');
      return;
    }
    if (!taskId || !taskId.trim()) {
      alert('Task ID is required.');
      return;
    }
    if (!formData.start_time) {
      alert('Start time is required.');
      return;
    }
    if (!formData.repeat_type) {
      alert('Repeat type is required.');
      return;
    }
    if (formData.description && formData.description.length > 100) {
      alert('Description must not exceed 100 characters.');
      return;
    }
    const payload = buildPayload();
    if (taskEvent.repeat_type !== 'none' || taskEvent.parent_event_id) {
      setShowUpdateConfirm(true);
      return;
    }
    let success = false;
    const result = await updateTaskEvent(taskEvent._id, payload);
    success = !!result;
    if (success) {
      resetForm();
      onSuccess();
      onClose();
    } else {
      alert('Could not update event. Please try again later.');
    }
  };

  // Hàm xử lý xác nhận update 1 hoặc tất cả
  const handleConfirmUpdate = async () => {
    let success = false;
    const payload = buildPayload();
    if (updateOption === 'all' && (taskEvent.repeat_type !== 'none' || taskEvent.parent_event_id)) {
      let eventsToUpdate = [];
      if (taskEvent.parent_event_id) {
        eventsToUpdate = taskEvents.filter(ev => ev.parent_event_id === taskEvent.parent_event_id || ev._id === taskEvent.parent_event_id);
      } else {
        eventsToUpdate = taskEvents.filter(ev => ev.repeat_type === taskEvent.repeat_type && ev.title === taskEvent.title && ev.task_id === taskEvent.task_id);
      }
      for (const ev of eventsToUpdate) {
        // Giữ nguyên ngày tháng năm, chỉ đổi giờ/phút
        const originalStart = new Date(ev.start_time);
        const originalEnd = ev.end_time ? new Date(ev.end_time) : null;
        const newStart = new Date(originalStart);
        const [newStartHour, newStartMinute] = [new Date(formData.start_time).getHours(), new Date(formData.start_time).getMinutes()];
        newStart.setHours(newStartHour, newStartMinute, 0, 0);
        let newEnd = null;
        if (originalEnd && formData.end_time) {
          newEnd = new Date(originalEnd);
          const [newEndHour, newEndMinute] = [new Date(formData.end_time).getHours(), new Date(formData.end_time).getMinutes()];
          newEnd.setHours(newEndHour, newEndMinute, 0, 0);
        }
        await updateTaskEvent(ev._id, {
          ...payload,
          start_time: newStart.toISOString(),
          end_time: newEnd ? newEnd.toISOString() : undefined
        });
      }
      refreshTaskEvents();
      success = true;
    } else {
      const result = await updateTaskEvent(taskEvent._id, payload);
      success = !!result;
    }
    setShowUpdateConfirm(false);
    if (success) {
      resetForm();
      onSuccess();
      onClose();
    } else {
      alert('Could not update event. Please try again later.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[400px] max-w-[95vw] bg-white rounded-xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
      onRequestClose={() => { resetForm(); onClose(); }}
      shouldCloseOnOverlayClick={false}
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit} className="p-4 md:p-6 flex flex-col gap-3">
        {/* Tiêu đề */}
        <input
          type="text"
          placeholder="Add schedule title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full border-0 border-b border-gray-200 py-2 mb-2 focus:outline-none focus:ring-0 focus:border-blue-400 placeholder-gray-400 text-base bg-blue-50/30 rounded-t-xl transition-all"
          autoFocus
        />
        {titleError && (
          <div className="text-red-500 text-xs mb-1">{titleError}</div>
        )}
        {/* Hiển thị ngày của event */}
        <div className="text-base text-gray-600 font-semibold mb-1 text-center">
          {formData.start_time ? new Date(formData.start_time).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
        </div>
        {/* Thời gian bắt đầu/kết thúc */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex flex-col flex-1">
            <label className="text-xs text-gray-500 mb-1" htmlFor="start-time">Start Time</label>
            <input
              id="start-time"
              type="time"
              value={(() => { try { return formData.start_time ? new Date(formData.start_time).toTimeString().slice(0, 5) : ''; } catch { return ''; } })()}
              onChange={e => {
                const newDate = new Date(formData.start_time);
                const [hours, minutes] = e.target.value.split(':').map(Number);
                newDate.setHours(hours, minutes);
                handleInputChange('start_time', newDate);
              }}
              className="border border-gray-200 rounded-md p-1.5 text-sm"
              placeholder="Start time"
            />
          </div>
          <span className="text-gray-400 mt-6">-</span>
          <div className="flex flex-col flex-1">
            <label className="text-xs text-gray-500 mb-1" htmlFor="end-time">End Time</label>
            <input
              id="end-time"
              type="time"
              value={(() => { try { return formData.end_time ? new Date(formData.end_time).toTimeString().slice(0, 5) : ''; } catch { return ''; } })()}
              onChange={e => {
                if (!formData.end_time) return;
                const newDate = new Date(formData.end_time);
                const [hours, minutes] = e.target.value.split(':').map(Number);
                newDate.setHours(hours, minutes);
                handleInputChange('end_time', newDate);
              }}
              className="border border-gray-200 rounded-md p-1.5 text-sm"
              placeholder="End time"
            />
          </div>
        </div>
        {/* Description */}
        <textarea
          placeholder="Add description"
          value={formData.description || ''}
          onChange={e => handleInputChange('description', e.target.value)}
          className="w-full border-0 border-b border-gray-200 py-2 focus:outline-none focus:ring-0 text-sm mb-2 resize-none min-h-[32px]"
        />
        {descError && (
          <div className="text-red-500 text-xs mb-1">{descError}</div>
        )}
        {/* Nút lưu/hủy */}
        <div className="flex justify-end gap-2 mt-2">
          <button 
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-base font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title.trim() || (formData.title && formData.title.length > 50) || (!!formData.description && formData.description.length > 100)}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold shadow-md hover:scale-105 hover:shadow-xl transition-all text-base disabled:bg-blue-300 disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </form>
      {/* Modal xác nhận update 1 hay tất cả */}
      <Modal
        isOpen={showUpdateConfirm}
        onRequestClose={() => setShowUpdateConfirm(false)}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] max-w-[90vw] bg-white rounded-lg shadow-2xl z-[2000] outline-none"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
        ariaHideApp={false}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Update recurring event</h2>
          <div className="mb-4">
            <label className="flex items-center space-x-3 mb-2 cursor-pointer">
              <input
                type="radio"
                name="updateOption"
                checked={updateOption === 'this'}
                onChange={() => setUpdateOption('this')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Update only this event</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="updateOption"
                checked={updateOption === 'all'}
                onChange={() => setUpdateOption('all')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Update all events in this series</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowUpdateConfirm(false)}
              className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-base font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmUpdate}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold shadow-md hover:scale-105 hover:shadow-xl transition-all text-base"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}; 