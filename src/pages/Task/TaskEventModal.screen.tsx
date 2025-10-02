import React, { useState, useEffect } from 'react';
import { TaskEvent, RepeatType, RepeatEndType } from '../../types/task-events/task-events.types';
import { useTaskEventForm } from '../../hooks/task-events/useTaskEventForm.hook';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import Modal from 'react-modal';
import { GROUP_CLASSNAMES } from '../../styles';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import DateTimePicker from '../../components/datetime-picker/DateTimePicker.component';
import { validateTaskEvent } from '../../utils/validate.util';

interface TaskEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskEvent?: TaskEvent;
  onSuccess: () => void;
  addEvent?: (event: TaskEvent) => void;
  updateEvent?: (eventId: string, event: TaskEvent) => void;
}

export const TaskEventModal: React.FC<TaskEventModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskEvent,
  onSuccess,
  addEvent,
  updateEvent
}) => {
  const { t } = useAppTranslate('task');
  const isEditMode = Boolean(taskEvent);
  const { formData, handleInputChange, resetForm, getCreatePayload, getUpdatePayload } = useTaskEventForm(taskEvent);
  const { createTaskEvent, updateTaskEvent, loading, error, setListOperations } = useTaskEventOperations();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3B82F6'); // Default blue

  useEffect(() => {
    if (addEvent && updateEvent) {
      setListOperations(
        addEvent,
        () => {},
        updateEvent
      );
    }
  }, [addEvent, updateEvent, setListOperations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    try {
      // Basic required field validation
      if (!taskId || !taskId.trim()) {
        alert(t('validation_task_id_required'));
        return;
      }
      if (!formData.repeat_type) {
        alert(t('validation_repeat_type_required'));
        return;
      }

      // Chuẩn hóa ngày giờ về ISO string
      const startTimeISO = (formData.start_time instanceof Date)
        ? formData.start_time.toISOString()
        : new Date(formData.start_time).toISOString();
      const endTimeISO = formData.end_time
        ? (formData.end_time instanceof Date ? formData.end_time.toISOString() : new Date(formData.end_time).toISOString())
        : undefined;

      // Gộp 3 trường thành description
      const mergedDescription = [
        (formData.guests?.join(', ') || '').trim(),
        (formData.location || '').trim(),
        (formData.description || '').trim()
      ].filter(Boolean).join('\n');

      // Use comprehensive validation from validate.util.ts
      const validationResult = validateTaskEvent({
        title: formData.title || '',
        start_time: startTimeISO,
        end_time: endTimeISO,
        description: mergedDescription
      });

      if (!validationResult.valid) {
        alert(t('validation_failed') + ': ' + validationResult.errors.map(error => t(error)).join(', '));
        return;
      }

      // Chuẩn hóa guests
      const guestsArr = Array.isArray(formData.guests) ? formData.guests.filter(g => !!g && g.trim()) : [];
      // Chuẩn hóa location
      const locationVal = formData.location || '';
      // Chuẩn hóa color
      const colorVal = selectedColor || '#3B82F6';
      if (isEditMode && taskEvent) {
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
        success = !!result;
      } else {
        const payload = getCreatePayload();
        payload.title = formData.title.trim();
        payload.task_id = taskId;
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
        const result = await createTaskEvent(payload);
        success = !!result;
      }
      if (success) {
        resetForm();
        onSuccess();
        onClose();
      } else {
        console.error('Operation failed but no error was thrown');
        alert(t('save_failed_try_again'));
      }
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      alert(t('error_generic_with_message', { message: err?.message || t('save_failed_short') }));
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Get day of week and formatted date for display
  const getDayAndDate = () => {
    const date = new Date(formData.start_time);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Format time for display
  const formatDisplayTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Format time for input
  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  // Handle time changes
  const handleStartTimeChange = (time: string) => {
    const newDate = new Date(formData.start_time);
    const [hours, minutes] = time.split(':').map(Number);
    newDate.setHours(hours, minutes);
    handleInputChange('start_time', newDate);
  };

  const handleEndTimeChange = (time: string) => {
    if (!formData.end_time) return;
    
    const newDate = new Date(formData.end_time);
    const [hours, minutes] = time.split(':').map(Number);
    newDate.setHours(hours, minutes);
    handleInputChange('end_time', newDate);
  };

  // Handle all day toggle
  const handleAllDayToggle = (checked: boolean) => {
    // @ts-ignore - The type in the hook expects string | number | Date | undefined, but we're passing boolean
    handleInputChange('all_day', checked);
    
    if (checked) {
      // Set times to start of day and end of day
      const startDate = new Date(formData.start_time);
      startDate.setHours(0, 0, 0, 0);
      handleInputChange('start_time', startDate);
      
      const endDate = new Date(formData.end_time || startDate);
      endDate.setHours(23, 59, 59, 999);
      handleInputChange('end_time', endDate);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[95vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
      onRequestClose={handleCancel}
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit} className="p-4 md:p-6 flex flex-col gap-3">
        {/* Tiêu đề */}
        <input
          type="text"
          placeholder={t('event_title_placeholder')}
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full border-0 border-b border-gray-200 py-2 mb-2 focus:outline-none focus:ring-0 focus:border-blue-400 placeholder-gray-400 text-base bg-blue-50/30 rounded-t-xl transition-all"
          autoFocus
        />
        {/* Start Time */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('start_time_label')}
          </label>
          <DateTimePicker
            value={formData.start_time}
            onChange={(date: Date) => {
              handleInputChange('start_time', date);
            }}
            onClear={() => {
              handleInputChange('start_time', new Date());
            }}
            placeholder={t('start_time_placeholder')}
            showTime={true}
            timeFormat="24h"
            className="w-full"
          />
        </div>

        {/* End Time */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('end_time_label')}
          </label>
          <DateTimePicker
            value={formData.end_time}
            onChange={(date: Date) => {
              handleInputChange('end_time', date);
            }}
            onClear={() => {
              handleInputChange('end_time', undefined);
            }}
            placeholder={t('end_time_placeholder')}
            showTime={true}
            timeFormat="24h"
            className="w-full"
          />
        </div>
        {/* Lặp lại */}
        <div className="relative w-full mb-2">
            <button
              type="button"
              onClick={() => setShowRepeatOptions(!showRepeatOptions)}
            className="w-full text-left py-1 text-sm flex justify-between items-center border border-gray-200 rounded-md px-2"
            >
              <span>{formData.repeat_type === 'none' ? t('repeat_none') : 
                     formData.repeat_type === 'daily' ? t('repeat_daily') :
                     formData.repeat_type === 'weekly' ? t('repeat_weekly') :
                     formData.repeat_type === 'monthly' ? t('repeat_monthly') :
                     formData.repeat_type === 'yearly' ? t('repeat_yearly') : t('repeat_custom')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showRepeatOptions && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                <div 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleInputChange('repeat_type', 'none');
                    setShowRepeatOptions(false);
                  }}
                >
                  {t('repeat_none')}
                </div>
                <div 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleInputChange('repeat_type', 'daily');
                    setShowRepeatOptions(false);
                  }}
                >
                  {t('repeat_daily')}
                </div>
                <div 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleInputChange('repeat_type', 'weekly');
                    setShowRepeatOptions(false);
                  }}
                >
                  {t('repeat_weekly')}
                </div>
                <div 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleInputChange('repeat_type', 'monthly');
                    setShowRepeatOptions(false);
                  }}
                >
                  {t('repeat_monthly')}
                </div>
                <div 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleInputChange('repeat_type', 'yearly');
                    setShowRepeatOptions(false);
                  }}
                >
                  {t('repeat_yearly')}
                </div>
              </div>
            )}
          </div>
        {/* Chọn màu */}
        <div className="flex items-center gap-2 mb-4 mt-2">
          {[['#3B82F6', 'Blue'], ['#F87171', 'Red'], ['#FBBF24', 'Yellow'], ['#10B981', 'Green'], ['#A78BFA', 'Purple']].map(([color, label]) => (
            <div
              key={color}
              className={`w-6 h-6 rounded-full cursor-pointer border-2 border-white shadow-md flex items-center justify-center transition-transform duration-200 ${selectedColor === color ? 'ring-4 ring-blue-200 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              title={label}
            ></div>
          ))}
          </div>
        {/* Add Guest */}
        <textarea
          placeholder={t('add_guest_placeholder')}
          value={formData.guests?.join(', ') || ''}
          onChange={e => handleInputChange('guests', e.target.value.split(',').map(g => g.trim()))}
          className="w-full border-0 border-b border-gray-200 py-2 focus:outline-none focus:ring-0 text-sm mb-2 resize-none min-h-[32px]"
        />
        {/* Location/URL */}
        <textarea
          placeholder={t('location_placeholder')}
          value={formData.location || ''}
          onChange={e => handleInputChange('location', e.target.value)}
          className="w-full border-0 border-b border-gray-200 py-2 focus:outline-none focus:ring-0 text-sm mb-2 resize-none min-h-[32px]"
        />
        {/* Description */}
        <textarea
          placeholder={t('add_description_placeholder')}
          value={formData.description || ''}
          onChange={e => handleInputChange('description', e.target.value)}
          className="w-full border-0 border-b border-gray-200 py-2 focus:outline-none focus:ring-0 text-sm mb-2 resize-none min-h-[32px]"
        />
        {/* Nút lưu/hủy */}
        <div className="flex justify-end gap-2 mt-2">
            <button 
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-base font-semibold transition-all"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold shadow-md hover:scale-105 hover:shadow-xl transition-all text-base disabled:bg-blue-300 disabled:opacity-60"
            >
              {t('save')}
            </button>
        </div>
      </form>
    </Modal>
  );
};