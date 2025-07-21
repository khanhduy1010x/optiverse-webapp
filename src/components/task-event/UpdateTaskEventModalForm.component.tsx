import React, { useState } from 'react';
import Modal from 'react-modal';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { useTaskEventForm } from '../../hooks/task-events/useTaskEventForm.hook';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      alert('Title is required.');
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
    const startTimeISO = (formData.start_time instanceof Date)
      ? formData.start_time.toISOString()
      : new Date(formData.start_time).toISOString();
    const endTimeISO = formData.end_time
      ? (formData.end_time instanceof Date ? formData.end_time.toISOString() : new Date(formData.end_time).toISOString())
      : undefined;
    const mergedDescription = [
      (formData.guests?.join(', ') || '').trim(),
      (formData.location || '').trim(),
      (formData.description || '').trim()
    ].filter(Boolean).join('\n');
    const guestsArr = Array.isArray(formData.guests) ? formData.guests.filter(g => !!g && g.trim()) : [];
    const locationVal = formData.location || '';
    const colorVal = selectedColor || '#3B82F6';
    const payload = getUpdatePayload();
    payload.title = formData.title.trim();
    payload.start_time = startTimeISO;
    payload.end_time = endTimeISO;
    payload.description = mergedDescription;
    payload.guests = guestsArr;
    payload.location = locationVal;
    payload.color = colorVal;
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
    const result = await updateTaskEvent(taskEvent._id, payload);
    if (result) {
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
            disabled={loading || !formData.title.trim()}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold shadow-md hover:scale-105 hover:shadow-xl transition-all text-base disabled:bg-blue-300 disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}; 