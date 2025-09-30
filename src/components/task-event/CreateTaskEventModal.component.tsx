import React, { useState } from 'react';
import Modal from 'react-modal';
import { useTaskEventForm } from '../../hooks/task-events/useTaskEventForm.hook';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { CalendarDatePicker } from './CalendarDatePicker.component';
import { TimePickerDropdown } from './TimePickerDropdown.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface CreateTaskEventModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onSuccess: () => void;
  addEvent?: (event: TaskEvent) => void;
}

export const CreateTaskEventModalForm: React.FC<CreateTaskEventModalFormProps> = ({
  isOpen,
  onClose,
  taskId,
  onSuccess,
  addEvent
}) => {
  const { t } = useAppTranslate('task');
  const { formData, handleInputChange, resetForm } = useTaskEventForm();
  const { createTaskEvent, loading } = useTaskEventOperations();
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [dateError, setDateError] = useState('');

  // Validate To Date > Start Date
  React.useEffect(() => {
    let error = '';
    if (
      (formData.repeat_type === 'daily' || formData.repeat_type === 'weekly' || formData.repeat_type === 'monthly' || formData.repeat_type === 'yearly') &&
      formData.start_time && formData.repeat_to
    ) {
      let start = new Date(formData.start_time);
      let end;
      if (formData.repeat_type === 'weekly') {
        // repeat_to dạng yyyy-Www
        const [yearStr, weekStr] = String(formData.repeat_to).split('-W');
        const year = Number(yearStr);
        const week = Number(weekStr);
        if (year && week) {
          const simple = new Date(year, 0, 1 + (week - 1) * 7);
          const dow = simple.getDay();
          const ISOweekStart = new Date(simple);
          if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
          else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
          // Ngày cuối tuần (chủ nhật)
          end = new Date(ISOweekStart);
          end.setDate(ISOweekStart.getDate() + 6);
        }
      } else if (formData.repeat_type === 'monthly') {
        // repeat_to dạng yyyy-mm
        const [yearStr, monthStr] = String(formData.repeat_to).split('-');
        const year = Number(yearStr);
        const month = Number(monthStr) - 1;
        if (year && month >= 0) {
          end = new Date(year, month + 1, 0); // ngày cuối tháng
        }
      } else if (formData.repeat_type === 'yearly') {
        // repeat_to là năm
        const year = Number(formData.repeat_to);
        if (year) {
          end = new Date(year, 11, 31);
        }
      } else {
        // daily
        end = new Date(formData.repeat_to);
      }
      if (end && start >= end) {
        error = 'To Date must be after Start Date.';
      }
    }
    setDateError(error);
  }, [formData.start_time, formData.repeat_to, formData.repeat_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      alert(t('title_required'));
      return;
    }
    if (formData.title.length > 50) {
      alert(t('title_max_length'));
      return;
    }
    if (!taskId || !taskId.trim()) {
      alert(t('task_id_required'));
      return;
    }
    if (!formData.start_time) {
      alert(t('start_time_required'));
      return;
    }
    if (!formData.repeat_type) {
      alert(t('repeat_type_required'));
      return;
    }
    if (formData.description && formData.description.length > 100) {
      alert(t('description_max_length'));
      return;
    }

    // Lấy thời gian bắt đầu/kết thúc mẫu - xử lý đúng timezone
    // formData.start_time có dạng "YYYY-MM-DDTHH:mm" từ datetime-local input
    const startTime = new Date(formData.start_time);
    const endTime = formData.end_time ? new Date(formData.end_time) : null;
    const mergedDescription = (formData.description || '').trim();
    const colorVal = selectedColor || '#3B82F6';

    // Lấy khoảng lặp lại
    const repeatTo = formData.repeat_to;
    const repeatType = formData.repeat_type;

    // Tạo event gốc duy nhất với thông tin recurring
    // Virtual instances sẽ được tạo tự động bởi generateRecurringEvents
    const eventStart = startTime;
    let eventEnd: Date | undefined = undefined;
    if (endTime) {
      eventEnd = endTime;
    }
    
    console.log('Event times - start:', eventStart.toISOString(), 'end:', eventEnd?.toISOString());
    
    // Xử lý repeat_end_date dựa trên repeat_type và repeatTo
    let repeatEndDate: Date | undefined = undefined;
    if (repeatTo && repeatType !== 'none') {
      if (repeatType === 'daily') {
        // Xử lý date input để tránh vấn đề timezone
        // repeatTo có dạng "YYYY-MM-DD", tạo Date object với local timezone
        const [year, month, day] = repeatTo.split('-').map(Number);
        repeatEndDate = new Date(year, month - 1, day, 23, 59, 59, 999); // Cuối ngày
        console.log('Daily repeat - repeatTo:', repeatTo, 'parsed to:', repeatEndDate.toISOString());
      } else if (repeatType === 'weekly') {
        // repeatTo dạng yyyy-Www, chuyển thành ngày cuối tuần
        const [yearStr, weekStr] = String(repeatTo).split('-W');
        const year = Number(yearStr);
        const week = Number(weekStr);
        if (year && week) {
          const simple = new Date(year, 0, 1 + (week - 1) * 7);
          const dow = simple.getDay();
          const ISOweekStart = new Date(simple);
          if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
          else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
          repeatEndDate = new Date(ISOweekStart);
          repeatEndDate.setDate(ISOweekStart.getDate() + 6);
        }
      } else if (repeatType === 'monthly') {
        // repeatTo dạng yyyy-mm, chuyển thành ngày cuối tháng
        const [yearStr, monthStr] = String(repeatTo).split('-');
        const year = Number(yearStr);
        const month = Number(monthStr) - 1;
        if (year && month >= 0) {
          repeatEndDate = new Date(year, month + 1, 0);
        }
      } else if (repeatType === 'yearly') {
        // repeatTo là năm
        const year = Number(repeatTo);
        if (year) {
          repeatEndDate = new Date(year, 11, 31);
        }
      }
    }
    
    // Chuẩn bị payload cho event gốc với đầy đủ thông tin recurring
    const payload: TaskEvent = {
      _id: '', // Sẽ được tạo bởi backend
      task_id: taskId,
      title: formData.title.trim(),
      start_time: eventStart.toISOString(),
      end_time: eventEnd ? eventEnd.toISOString() : undefined,
      description: mergedDescription,
      repeat_type: repeatType as import('../../types/task-events/task-events.types').RepeatType,
      repeat_interval: 1, // Mặc định là 1
      repeat_end_type: repeatEndDate ? 'on' : 'never',
      repeat_end_date: repeatEndDate ? repeatEndDate.toISOString() : undefined,
      exclusion_dates: [], // Khởi tạo exclusion_dates rỗng
      color: colorVal,
      location: '',
      guests: []
    };
    
    console.log('Creating single original event with recurring info:', payload);
    console.log('repeatTo value:', repeatTo);
    console.log('repeatEndDate calculated:', repeatEndDate);
    console.log('repeatEndDate ISO:', repeatEndDate ? repeatEndDate.toISOString() : 'undefined');
    
    // Sử dụng addEvent nếu có, nếu không thì dùng createTaskEvent
    if (addEvent) {
      await addEvent(payload);
    } else {
      // Convert Date objects to ISO strings for API
      await createTaskEvent({
        task_id: taskId,
        title: formData.title.trim(),
        start_time: eventStart.toISOString(),
        end_time: eventEnd ? eventEnd.toISOString() : undefined,
        description: mergedDescription,
        repeat_type: repeatType as import('../../types/task-events/task-events.types').RepeatType,
        repeat_interval: 1,
        repeat_end_type: repeatEndDate ? 'on' : 'never',
        repeat_end_date: repeatEndDate ? repeatEndDate.toISOString() : undefined,
        exclusion_dates: [], // Khởi tạo exclusion_dates rỗng
        color: colorVal,
        location: '',
        guests: []
      });
    }

      resetForm();
      onSuccess();
      onClose();
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Modal 
      isOpen={isOpen}
      className="fixed inset-0 flex items-center justify-center z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
      onRequestClose={() => { resetForm(); onClose(); }}
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col relative">
        
        <button
          type="button"
          onClick={() => { resetForm(); onClose(); }}
          className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      
      {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder={t('add_title')}
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full text-xl font-medium border-0 border-b-2 border-transparent focus:border-blue-500 focus:outline-none pb-2 placeholder-gray-400"
                autoFocus
              />
              {formData.title && formData.title.length > 50 && (
                <div className="text-red-500 text-xs mt-1">{t('title_max_length')}</div>
              )}
            </div>

            {/* Date and Time Section */}
            <div className="space-y-3">
              {/* Date Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">
                    {formData.start_time ? formatDate(formData.start_time.toISOString()) : t('select_date')}
                  </span>
                </button>
                
                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-1 z-50">
                    <CalendarDatePicker
                      selectedDate={formData.start_time ? new Date(formData.start_time) : new Date()}
                      onDateSelect={(date) => {
                        const currentTime = formData.start_time ? new Date(formData.start_time) : new Date();
                        date.setHours(currentTime.getHours(), currentTime.getMinutes());
                        handleInputChange('start_time', date.toISOString());
                        setShowDatePicker(false);
                      }}
                      isOpen={showDatePicker}
                      onClose={() => setShowDatePicker(false)}
                    />
                  </div>
                )}
              </div>

              {/* Time Pickers: always visible (removed All Day toggle) */}
              <div className="flex items-center gap-3">
                {/* Start Time */}
                <div className="flex-1 relative">
                  <button
                      type="button"
                      onClick={() => setShowStartTimePicker(!showStartTimePicker)}
                      className="flex items-center gap-2 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">
                        {formData.start_time ? formatTime(formData.start_time.toISOString()) : t('start_time')}
                      </span>
                    </button>
                    
                    {showStartTimePicker && (
                      <div className="absolute top-full left-0 mt-1 z-50">
                        <TimePickerDropdown
                          selectedTime={formData.start_time ? formatTime(formData.start_time.toISOString()) : ''}
                          onTimeSelect={(time: string) => {
                            const currentDate = formData.start_time ? new Date(formData.start_time) : new Date();
                            const [timeStr, period] = time.split(' ');
                            const [hours, minutes] = timeStr.split(':').map(Number);
                            let adjustedHours = hours;
                            if (period === 'PM' && hours !== 12) adjustedHours += 12;
                            if (period === 'AM' && hours === 12) adjustedHours = 0;
                            
                            currentDate.setHours(adjustedHours, minutes);
                            handleInputChange('start_time', currentDate.toISOString());
                            setShowStartTimePicker(false);
                          }}
                          isOpen={showStartTimePicker}
                          onClose={() => setShowStartTimePicker(false)}
                        />
                      </div>
                    )}
                  </div>

                  <span className="text-gray-400">-</span>

                  {/* End Time */}
                  <div className="flex-1 relative">
                    <button
                      type="button"
                      onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                      className="flex items-center gap-2 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">
                        {formData.end_time ? formatTime(formData.end_time.toISOString()) : t('end_time')}
                      </span>
                    </button>
                    
                    {showEndTimePicker && (
                      <div className="absolute top-full left-0 mt-1 z-50">
                        <TimePickerDropdown
                          selectedTime={formData.end_time ? formatTime(formData.end_time.toISOString()) : ''}
                          onTimeSelect={(time: string) => {
                            const currentDate = formData.end_time ? new Date(formData.end_time) : new Date(formData.start_time || new Date());
                            const [timeStr, period] = time.split(' ');
                            const [hours, minutes] = timeStr.split(':').map(Number);
                            let adjustedHours = hours;
                            if (period === 'PM' && hours !== 12) adjustedHours += 12;
                            if (period === 'AM' && hours === 12) adjustedHours = 0;
                            
                            currentDate.setHours(adjustedHours, minutes);
                            handleInputChange('end_time', currentDate.toISOString());
                            setShowEndTimePicker(false);
                          }}
                          isOpen={showEndTimePicker}
                          onClose={() => setShowEndTimePicker(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
            </div>

            {/* Repeat Options */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRepeatOptions(!showRepeatOptions)}
                className="flex items-center gap-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-gray-700">
                  {formData.repeat_type === 'none' ? t('does_not_repeat') : 
                   formData.repeat_type === 'daily' ? t('daily') :
                   formData.repeat_type === 'weekly' ? t('weekly') :
                   formData.repeat_type === 'monthly' ? t('monthly') :
                   formData.repeat_type === 'yearly' ? t('yearly') : t('custom')}
                </span>
              </button>
              
              {showRepeatOptions && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                  <div 
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      handleInputChange('repeat_type', 'none');
                      setShowRepeatOptions(false);
                    }}
                  >
                    {t('does_not_repeat')}
                  </div>
                  <div 
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      handleInputChange('repeat_type', 'daily');
                      setShowRepeatOptions(false);
                    }}
                  >
                    {t('daily')}
                  </div>
                  <div 
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      handleInputChange('repeat_type', 'weekly');
                      setShowRepeatOptions(false);
                    }}
                  >
                    {t('weekly')}
                  </div>
                  <div 
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      handleInputChange('repeat_type', 'monthly');
                      setShowRepeatOptions(false);
                    }}
                  >
                    {t('monthly')}
                  </div>
                  <div 
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      handleInputChange('repeat_type', 'yearly');
                      setShowRepeatOptions(false);
                    }}
                  >
                    {t('yearly')}
                  </div>
                </div>
              )}
            </div>

            {/* Repeat End Date - Only show if repeat is not 'none' */}
            {(formData.repeat_type === 'daily' || formData.repeat_type === 'weekly' || formData.repeat_type === 'monthly' || formData.repeat_type === 'yearly') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {formData.repeat_type === 'daily' && t('to_date')}
                  {formData.repeat_type === 'weekly' && t('to_week')}
                  {formData.repeat_type === 'monthly' && t('to_month')}
                  {formData.repeat_type === 'yearly' && t('to_year')}
                </label>
                {formData.repeat_type === 'daily' && (
                  <input
                    type="date"
                    value={formData.repeat_to || ''}
                    onChange={e => handleInputChange('repeat_to', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
                {formData.repeat_type === 'weekly' && (
                  <input
                    type="week"
                    value={formData.repeat_to || ''}
                    onChange={e => handleInputChange('repeat_to', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
                {formData.repeat_type === 'monthly' && (
                  <input
                    type="month"
                    value={formData.repeat_to || ''}
                    onChange={e => handleInputChange('repeat_to', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
                {formData.repeat_type === 'yearly' && (
                  <input
                    type="number"
                    min={new Date().getFullYear()}
                    max={2100}
                    value={formData.repeat_to || ''}
                    onChange={e => handleInputChange('repeat_to', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('year')}
                  />
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <textarea
                placeholder={t('add_description')}
                value={formData.description || ''}
                onChange={e => handleInputChange('description', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              {!!formData.description && formData.description.length > 100 && (
                <div className="text-red-500 text-xs">{t('description_max_length')}</div>
              )}
            </div>

            {/* Error Messages */}
            {dateError && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{dateError}</div>
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
            disabled={
              loading ||
              !formData.title?.trim() ||
              (formData.title && formData.title.length > 50) ||
              (!!formData.description && formData.description.length > 100) ||
              !!dateError
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </Modal>
  );
};