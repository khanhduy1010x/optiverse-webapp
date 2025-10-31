import React, { useState } from 'react';
import Modal from 'react-modal';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { useTaskEventForm } from '../../hooks/task-events/useTaskEventForm.hook';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import { useTaskEventList } from '../../hooks/task-events/useTaskEventList.hook';
import { ColorPicker } from './ColorPicker.component';
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
  const [selectedColor, setSelectedColor] = useState(taskEvent.color || '#3B82F6');
  const [titleError, setTitleError] = useState('');
  const [descError, setDescError] = useState('');
  const userId = useAppSelector(state => state.auth.user?._id);

  const { taskEvents, refreshTaskEvents } = useTaskEventList();

  // Xác nhận cập nhật cho sự kiện lặp lại (UI đẹp mắt, đồng bộ design)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);

  // Đồng bộ selectedColor khi taskEvent thay đổi
  React.useEffect(() => {
    setSelectedColor(taskEvent.color || '#3B82F6');
  }, [taskEvent.color]);

  // Cập nhật formData color khi selectedColor thay đổi
  React.useEffect(() => {
    handleInputChange('color', selectedColor);
  }, [selectedColor]);

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
    // Color được lấy từ formData thông qua hook, không cần override
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
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[450px] max-w-[95vw] bg-white rounded-xl shadow-2xl z-[2000] outline-none"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
        onRequestClose={() => { resetForm(); onClose(); }}
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Header: Title + Color Picker + Close Button */}
          <div className="flex items-start justify-between gap-3 px-4 md:px-6 pt-4 md:pt-6 pb-2 border-b border-gray-100">
            <input
              type="text"
              placeholder={t('event_title_placeholder')}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="flex-1 border-0 border-b border-gray-200 py-2 focus:outline-none focus:ring-0 focus:border-blue-400 placeholder-gray-400 text-base bg-blue-50/30 rounded-t-xl transition-all"
              autoFocus
            />
            <div className="flex-shrink-0">
              <ColorPicker
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
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

          {/* Content */}
          <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-3">
            {titleError && (
              <div className="text-red-500 text-xs">{titleError}</div>
            )}
            {/* Hiển thị ngày của event */}
            <div className="text-base text-gray-600 font-semibold mb-1 text-center">
            {formData.start_time ? new Date(formData.start_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </div>
          {/* Thời gian bắt đầu/kết thúc */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex flex-col flex-1">
              <label className="text-xs text-gray-500 mb-1" htmlFor="start-time">{t('start_time_label')}</label>
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
                placeholder={t('start_time_placeholder')}
              />
            </div>
            <span className="text-gray-400 mt-6">{t('time_range_sep')}</span>
            <div className="flex flex-col flex-1">
              <label className="text-xs text-gray-500 mb-1" htmlFor="end-time">{t('end_time_label')}</label>
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
                placeholder={t('end_time_placeholder')}
              />
            </div>
          </div>
          {/* Description */}
          <textarea
            placeholder={t('add_description_placeholder')}
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
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || (formData.title && formData.title.length > 50) || (!!formData.description && formData.description.length > 100)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold shadow-md hover:scale-105 hover:shadow-xl transition-all text-base disabled:bg-blue-300 disabled:opacity-60"
            >
              {t('save')}
            </button>
          </div>
          </div>
        </form>

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