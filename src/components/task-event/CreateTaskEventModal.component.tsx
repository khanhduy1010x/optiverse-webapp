import React, { useState } from 'react';
import Modal from 'react-modal';
import { useTaskEventForm } from '../../hooks/task-events/useTaskEventForm.hook';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import { TaskEvent } from '../../types/task-events/task-events.types';

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
  const { formData, handleInputChange, resetForm, getCreatePayload } = useTaskEventForm();
  const { createTaskEvent, loading } = useTaskEventOperations();
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);
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
        {formData.title && formData.title.length > 50 && (
          <div className="text-red-500 text-xs mb-1">Title must not exceed 50 characters.</div>
        )}
        {/* Ngày bắt đầu/kết thúc */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex flex-col flex-1">
            <label className="text-xs text-gray-500 mb-1" htmlFor="start-date">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={formData.start_time ? new Date(formData.start_time).toISOString().slice(0, 10) : ''}
              onChange={e => {
                const date = new Date(e.target.value);
                const prev = new Date(formData.start_time ?? Date.now());
                date.setHours(prev.getHours(), prev.getMinutes());
                handleInputChange('start_time', date);
              }}
              className="border border-gray-200 rounded-md p-1.5 text-sm"
              placeholder="Start date"
            />
          </div>
          {/* Đã xoá End Date ở đây */}
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
        {/* Lặp lại */}
        <div className="relative w-full mb-2">
          <button
            type="button"
            onClick={() => setShowRepeatOptions(!showRepeatOptions)}
            className="w-full text-left py-1 text-sm flex justify-between items-center border border-gray-200 rounded-md px-2"
          >
            <span>{formData.repeat_type === 'none' ? 'Does not repeat' : 
                   formData.repeat_type === 'daily' ? 'Daily' :
                   formData.repeat_type === 'weekly' ? 'Weekly' :
                   formData.repeat_type === 'monthly' ? 'Monthly' :
                   formData.repeat_type === 'yearly' ? 'Yearly' : 'Custom'}</span>
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
                Does not repeat
              </div>
              <div 
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  handleInputChange('repeat_type', 'daily');
                  setShowRepeatOptions(false);
                }}
              >
                Daily
              </div>
              <div 
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  handleInputChange('repeat_type', 'weekly');
                  setShowRepeatOptions(false);
                }}
              >
                Weekly
              </div>
              <div 
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  handleInputChange('repeat_type', 'monthly');
                  setShowRepeatOptions(false);
                }}
              >
                Monthly
              </div>
              <div 
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  handleInputChange('repeat_type', 'yearly');
                  setShowRepeatOptions(false);
                }}
              >
                Yearly
              </div>
            </div>
          )}
        </div>
        {/* Chọn khoảng thời gian lặp lại */}
        {(formData.repeat_type === 'daily' || formData.repeat_type === 'weekly' || formData.repeat_type === 'monthly' || formData.repeat_type === 'yearly') && (
          <div className="flex gap-2 mb-2">
            <div className="flex flex-col flex-1">
              <label className="text-xs text-gray-500 mb-1">
                {formData.repeat_type === 'daily' && 'To Date'}
                {formData.repeat_type === 'weekly' && 'To Week'}
                {formData.repeat_type === 'monthly' && 'To Month'}
                {formData.repeat_type === 'yearly' && 'To Year'}
              </label>
              {formData.repeat_type === 'daily' && (
                <input
                  type="date"
                  value={formData.repeat_to || ''}
                  onChange={e => handleInputChange('repeat_to', e.target.value)}
                  className="border border-gray-200 rounded-md p-1.5 text-sm"
                />
              )}
              {formData.repeat_type === 'weekly' && (
                <input
                  type="week"
                  value={formData.repeat_to || ''}
                  onChange={e => handleInputChange('repeat_to', e.target.value)}
                  className="border border-gray-200 rounded-md p-1.5 text-sm"
                />
              )}
              {formData.repeat_type === 'monthly' && (
                <input
                  type="month"
                  value={formData.repeat_to || ''}
                  onChange={e => handleInputChange('repeat_to', e.target.value)}
                  className="border border-gray-200 rounded-md p-1.5 text-sm"
        />
              )}
              {formData.repeat_type === 'yearly' && (
                <input
                  type="number"
                  min={new Date().getFullYear()}
                  max={2100}
                  value={formData.repeat_to || ''}
                  onChange={e => handleInputChange('repeat_to', e.target.value)}
                  className="border border-gray-200 rounded-md p-1.5 text-sm"
                  placeholder="Year"
        />
              )}
            </div>
          </div>
        )}
        {/* Description */}
        <textarea
          placeholder="Add description"
          value={formData.description || ''}
          onChange={e => handleInputChange('description', e.target.value)}
          className="w-full border-0 border-b border-gray-200 py-2 focus:outline-none focus:ring-0 text-sm mb-2 resize-none min-h-[32px]"
        />
        {!!formData.description && formData.description.length > 100 && (
          <div className="text-red-500 text-xs mb-1">Description must not exceed 100 characters.</div>
        )}
        {dateError && (
          <div className="text-red-500 text-xs mb-1">{dateError}</div>
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
            disabled={
              loading ||
              !formData.title.trim() ||
              (formData.title && formData.title.length > 50) ||
              (!!formData.description && formData.description.length > 100)
             || !!dateError
            }
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold shadow-md hover:scale-105 hover:shadow-xl transition-all text-base disabled:bg-blue-300 disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};