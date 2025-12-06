import React, { useState } from 'react';
import Modal from 'react-modal';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { useTaskEventForm } from '../../hooks/task-events/useTaskEventForm.hook';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import { useTaskEventList } from '../../hooks/task-events/useTaskEventList.hook';
import { ColorPickerUpdate } from './ColorPickerUpdate.component';
import { TimePickerInput } from './TimePickerInput.component';
import { CalendarDatePicker } from './CalendarDatePicker.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { useAppSelector } from '../../store/hooks';
import { GROUP_CLASSNAMES } from '../../styles';


interface UpdateTaskEventModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskEvent: TaskEvent;
  onSuccess: () => void;
  updateEvent?: (eventId: string, event: TaskEvent, updateOption?: 'all' | 'this') => void;
}

export const UpdateTaskEventModalForm: React.FC<UpdateTaskEventModalFormProps> = ({
  isOpen,
  onClose,
  taskEvent,
  onSuccess,
  updateEvent
}) => {
  const { t } = useAppTranslate('task');
  const { formData, handleInputChange, resetForm, getUpdatePayload } = useTaskEventForm(taskEvent);
  const { updateTaskEvent, loading } = useTaskEventOperations();
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateButtonRef = React.useRef<HTMLButtonElement>(null);
  const [selectedColor, setSelectedColor] = useState(taskEvent.color || '#3B82F6');
  const [titleError, setTitleError] = useState('');
  const [descError, setDescError] = useState('');
  const [dateTimeError, setDateTimeError] = useState('');
  const [tempStartTimeCleared, setTempStartTimeCleared] = useState(false);
  const [tempEndTimeCleared, setTempEndTimeCleared] = useState(false);
  const userId = useAppSelector(state => state.auth.user?._id);

  const { taskEvents } = useTaskEventList();

  // Xác nhận cập nhật cho sự kiện lặp lại (UI đẹp mắt, đồng bộ design)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);

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
    setTitleError(formData.title && formData.title.length > 50 ? t('create_title_max') : '');
    setDescError(formData.description && formData.description.length > 100 ? t('edit_desc_max') : '');
  }, [formData.title, formData.description, t]);

  // Helper function to format time as HH:mm
  const formatTimeToHHmm = (dateInput: Date | string): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Helper function to format date display
  const formatDate = (dateInput: Date | string): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      alert(t('validation_title_required'));
      return;
    }
    if (formData.title.length > 50) {
      alert(t('create_title_max'));
      return;
    }
    if (!userId || !userId.trim()) {
      alert(t('validation_user_id_required'));
      return;
    }
    if (!formData.start_time) {
      alert(t('validation_start_time_required'));
      return;
    }
    if (!formData.repeat_type) {
      alert(t('validation_repeat_type_required'));
      return;
    }
    if (formData.description && formData.description.length > 100) {
      alert(t('edit_desc_max'));
      return;
    }
    const payload = buildPayload();
    const isRecurring = taskEvent.repeat_type && taskEvent.repeat_type !== 'none';
    const isRecurringInstance = taskEvent._id?.includes('::recurrence::') || taskEvent.parent_event_id;
    if (isRecurring || isRecurringInstance) {
      setPendingPayload(payload);
      setIsConfirmOpen(true);
      return;
    }
    let success = false;
    const result = await updateTaskEvent(taskEvent._id, payload);
    success = !!result;
    if (success) {
      if (updateEvent) updateEvent(taskEvent._id, { ...taskEvent, ...payload }, 'this');
      resetForm();
      onSuccess();
      onClose();
    } else {
      alert(t('save_failed_try_again'));
    }
  };

  // Hàm xử lý xác nhận update 1 hoặc tất cả
  const handleConfirmUpdate = async (option: 'this' | 'all', payload: any) => {
    let success = false;

    try {
      if (!updateEvent) {
        // Nếu không có hàm updateEvent từ props, không thực hiện logic cập nhật thủ công để tránh cập nhật sai phạm vi
        // Thông báo lỗi nhẹ cho người dùng
        alert(t('save_failed_try_again'));
        return;
      }

      // Ủy quyền toàn bộ xử lý cập nhật cho hook useTaskEventList thông qua prop updateEvent
      // Hook sẽ tự xử lý logic: 'this' => exclusion + tạo event single, 'all' => cập nhật event gốc và regenerate
      updateEvent(taskEvent._id, { ...taskEvent, ...payload } as TaskEvent, option);

      success = true;
    } catch (e) {
      console.error('handleConfirmUpdate error:', e);
      success = false;
    }

    if (success) {
      resetForm();
      onSuccess();
      onClose();
    } else {
      alert(t('save_failed_try_again'));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen}
        className="fixed inset-0 flex items-center justify-center z-[2000] outline-none"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
        onRequestClose={() => { resetForm(); onClose(); }}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col relative">
          {/* Header: Title + Color Picker + Close Button */}
          <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('event_title_placeholder')}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full text-xl font-medium border-0 border-b-2 border-transparent focus:border-blue-500 focus:outline-none pb-2 placeholder-gray-400"
                autoFocus
              />
              {titleError && (
                <div className="text-red-500 text-xs mt-1">{titleError}</div>
              )}
            </div>
            <div className="flex-shrink-0">
              <ColorPickerUpdate
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
                isModalOpen={isOpen}
              />
            </div>
            <button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={t('close')}
              aria-label={t('close')}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6">
            {titleError && (
              <div className="text-red-500 text-xs">{titleError}</div>
            )}
            {/* Date Picker */}
            <div className="relative mb-4">
              <button
                ref={dateButtonRef}
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700 font-medium">
                  {formData.start_time ? new Date(formData.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : t('select_date')}
                </span>
              </button>

              {showDatePicker && (
                <CalendarDatePicker
                  triggerRef={dateButtonRef}
                  selectedDate={formData.start_time ? new Date(formData.start_time) : new Date()}
                  onDateSelect={(date) => {
                    const currentTime = formData.start_time ? new Date(formData.start_time) : new Date();
                    date.setHours(currentTime.getHours(), currentTime.getMinutes());
                    handleInputChange('start_time', date);
                    setTempStartTimeCleared(false); // Reset flag when date is selected
                    setTempEndTimeCleared(false); // Also reset end time flag
                    setShowDatePicker(false);
                  }}
                  isOpen={showDatePicker}
                  onClose={() => setShowDatePicker(false)}
                />
              )}
            </div>

            {/* Thời gian bắt đầu/kết thúc */}
            <div className="flex gap-3 mb-4">
              {/* Start Time */}
              <div className="flex-1">
                <TimePickerInput
                  selectedTime={tempStartTimeCleared ? '' : (formData.start_time ? formatTimeToHHmm(formData.start_time) : '')}
                  onTimeSelect={(time: string) => {
                    if (!time) {
                      // When time is cleared, set flag to hide time display
                      setTempStartTimeCleared(true);
                      return;
                    }
                    
                    // Reset the flag when user enters new time
                    setTempStartTimeCleared(false);
                    
                    const currentDate = formData.start_time ? new Date(formData.start_time) : new Date();
                    const [hours, minutes] = time.split(':').map(Number);
                    currentDate.setHours(hours, minutes);
                    const newDateTime = new Date(currentDate);

                    // Check if date is today and time must be greater than current time
                    const now = new Date();
                    const newDateOnly = new Date(newDateTime);
                    newDateOnly.setHours(0, 0, 0, 0);
                    const todayOnly = new Date(now);
                    todayOnly.setHours(0, 0, 0, 0);

                    if (newDateOnly.getTime() === todayOnly.getTime()) {
                      if (newDateTime <= now) {
                        // Keep the date/time but show error
                        handleInputChange('start_time', newDateTime);
                        setDateTimeError('Time must be greater than current time for today.');
                        return;
                      }
                    }

                    handleInputChange('start_time', newDateTime);
                    setDateTimeError('');
                  }}
                  placeholder="HH:mm"
                  format24h={true}
                  className="w-full"
                />
              </div>

              <span className="text-gray-400 self-center">-</span>

              {/* End Time */}
              <div className="flex-1">
                <TimePickerInput
                  selectedTime={tempEndTimeCleared ? '' : (formData.end_time ? formatTimeToHHmm(formData.end_time) : '')}
                  onTimeSelect={(time: string) => {
                    if (!time) {
                      // When time is cleared, set flag to hide time display
                      setTempEndTimeCleared(true);
                      return;
                    }
                    
                    // Reset the flag when user enters new time
                    setTempEndTimeCleared(false);
                    
                    const currentDate = formData.end_time ? new Date(formData.end_time) : new Date();
                    const [hours, minutes] = time.split(':').map(Number);
                    currentDate.setHours(hours, minutes);
                    const newDateTime = new Date(currentDate);

                    // Check if date is today and time must be greater than current time
                    const now = new Date();
                    const newDateOnly = new Date(newDateTime);
                    newDateOnly.setHours(0, 0, 0, 0);
                    const todayOnly = new Date(now);
                    todayOnly.setHours(0, 0, 0, 0);

                    if (newDateOnly.getTime() === todayOnly.getTime()) {
                      if (newDateTime <= now) {
                        // Keep the date/time but show error
                        handleInputChange('end_time', newDateTime);
                        setDateTimeError('Time must be greater than current time for today.');
                        return;
                      }
                    }

                    handleInputChange('end_time', newDateTime);
                    setDateTimeError('');
                  }}
                  placeholder="HH:mm"
                  format24h={true}
                  startTime={formData.start_time ? formatTimeToHHmm(formData.start_time) : ''}
                  isEndTime={true}
                  className="w-full"
                />
              </div>
            </div>
            
            {dateTimeError && (
              <div className="text-red-500 text-xs mt-1">{dateTimeError}</div>
            )}
          {/* Description */}
          <textarea
            placeholder={t('add_description_placeholder')}
            value={formData.description || ''}
            onChange={e => handleInputChange('description', e.target.value)}
            className="w-full border-0 border-b border-gray-200 py-2 focus:outline-none focus:ring-0 text-sm resize-none min-h-[32px]"
          />
          {descError && (
            <div className="text-red-500 text-xs mt-1">{descError}</div>
          )}
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
            <button 
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim() || (formData.title && formData.title.length > 50) || (!!formData.description && formData.description.length > 100)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </div>

      </Modal>

      {/* Recurring Update Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onRequestClose={() => setIsConfirmOpen(false)}
        ariaHideApp={false}
        className={GROUP_CLASSNAMES.modalContainer}
        overlayClassName={GROUP_CLASSNAMES.modalOverlay}
      >
        <div className="p-6">
          <div className="flex flex-col items-center mb-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-600">
                <path fillRule="evenodd" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.59V7a1 1 0 10-2 0v6a1 1 0 00.293.707l3 3a1 1 0 101.414-1.414L13 12.59z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center">{t('recurring_update_title')}</h3>
            <p className="text-sm text-gray-600 text-center mt-1">
              {t('recurring_update_desc', { title: taskEvent.title || t('no_title') })}
            </p>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <button
              type="button"
              onClick={async () => {
                if (!pendingPayload) return;
                setIsConfirmOpen(false);
                await handleConfirmUpdate('this', pendingPayload);
                setPendingPayload(null);
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {t('update_this')}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!pendingPayload) return;
                setIsConfirmOpen(false);
                await handleConfirmUpdate('all', pendingPayload);
                setPendingPayload(null);
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t('update_all')}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              className={GROUP_CLASSNAMES.modalButtonCancel}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};