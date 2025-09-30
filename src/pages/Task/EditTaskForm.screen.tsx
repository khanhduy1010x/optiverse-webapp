import React, { useState } from 'react';
import { GROUP_CLASSNAMES } from '../../styles';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import Modal from 'react-modal';
import { isoToLocalDateTime, localDateTimeToISO } from '../../utils/date.utils';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { X } from 'lucide-react';
import { CalendarDatePicker } from '../../components/task-event/CalendarDatePicker.component';
import { TimePickerDropdown } from '../../components/task-event/TimePickerDropdown.component';

interface EditTaskFormProps {
  task: Task;
  onClose: () => void;
  onSave: (updated: { 
    title: string; 
    description: string; 
    status: string; 
    priority: string; 
    tags: Tag[];
    start_time?: string | Date;
    end_time?: string | Date;
  }) => Promise<boolean | void>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  status: 'pending' | 'completed' | 'overdue';
  setStatus: React.Dispatch<React.SetStateAction<'pending' | 'completed' | 'overdue'>>;
  priority: 'low' | 'medium' | 'high';
  setPriority: React.Dispatch<React.SetStateAction<'low' | 'medium' | 'high'>>;
  start_time: Date | string | undefined;
  setStartTime: React.Dispatch<React.SetStateAction<Date | string | undefined>>;
  end_time: Date | string | undefined;
  setEndTime: React.Dispatch<React.SetStateAction<Date | string | undefined>>;
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  allTags: Tag[];
  handleTagSelect: (tag: Tag) => void;
  showNewTagForm: boolean;
  setShowNewTagForm: React.Dispatch<React.SetStateAction<boolean>>;
  newTagName: string;
  setNewTagName: React.Dispatch<React.SetStateAction<string>>;
  newTagColor: string;
  setNewTagColor: React.Dispatch<React.SetStateAction<string>>;
  handleCreateNewTag: (
    newTagName: string,
    newTagColor: string,
    resetForm: () => void
  ) => Promise<Tag | null>;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({
  task,
  onClose,
  onSave,
  title,
  setTitle,
  description,
  setDescription,
  status,
  setStatus,
  priority,
  setPriority,
  start_time,
  setStartTime,
  end_time,
  setEndTime,
  selectedTags,
  setSelectedTags,
  allTags,
  handleTagSelect,
  showNewTagForm,
  setShowNewTagForm,
  newTagName,
  setNewTagName,
  newTagColor,
  setNewTagColor,
  handleCreateNewTag
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeadlineFields, setShowDeadlineFields] = useState(() => {
    return !!(task.start_time || task.end_time);
  });
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  const { t } = useAppTranslate('task');
  
  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    time?: string;
    general?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      description?: string;
      time?: string;
      general?: string;
    } = {};
    
    if (!title || !title.trim()) {
      newErrors.title = t('create_required_title');
    } else if (title.length > 50) {
      newErrors.title = t('create_title_max');
    }
    
    if (description && description.length > 150) {
      newErrors.description = t('create_desc_max');
    }
    
    if (start_time && end_time) {
      try {
        const startDate = start_time instanceof Date ? start_time : new Date(start_time);
        const endDate = end_time instanceof Date ? end_time : new Date(end_time);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          newErrors.time = t('create_invalid_date');
          setErrors(newErrors);
          return false;
        }
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        if (startDateOnly < today) {
          newErrors.time = t('create_start_in_past');
          setErrors(newErrors);
          return false;
        }
        
        if (endDate <= startDate) {
          newErrors.time = t('create_deadline_after_start');
          setErrors(newErrors);
          return false;
        }
      } catch (error) {
        newErrors.time = t('create_invalid_date');
        setErrors(newErrors);
        return false;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    let newStatus = status;
    if (status === 'overdue' && end_time) {
      const endDate = end_time instanceof Date ? end_time : new Date(end_time);
      if (!isNaN(endDate.getTime()) && endDate > new Date()) {
        newStatus = 'pending';
        setStatus('pending');
      }
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      
      const result = await onSave({
        title,
        description,
        status: newStatus,
        priority,
        tags: selectedTags,
        start_time,
        end_time
      });
      
      if (result !== false) {
        onClose();
      } else {
        setErrors({ general: t('error_failed_save') });
      }
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : t('error_failed_save') 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={true}
      className="fixed inset-0 flex items-center justify-center z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col relative">
        {/* Close button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Title */}
            <div>
              <input
                type="text"
                placeholder={t('add_title')}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: undefined }));
                  }
                }}
                className="w-full text-xl font-medium border-0 border-b-2 border-transparent focus:border-blue-500 focus:outline-none pb-2 placeholder-gray-400"
              />
              {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">{t('priority_label')}</label>
              <div className="flex gap-2">
                <button type="button" aria-label={t('priority_low')} onClick={() => setPriority('low')} className={`px-3 py-1 rounded-md border text-xs ${priority==='low'?'bg-blue-50 border-blue-400 text-blue-700':'border-gray-200 text-gray-700'}`}>{t('priority_low')}</button>
                <button type="button" aria-label={t('priority_medium')} onClick={() => setPriority('medium')} className={`px-3 py-1 rounded-md border text-xs ${priority==='medium'?'bg-blue-50 border-blue-400 text-blue-700':'border-gray-200 text-gray-700'}`}>{t('priority_medium')}</button>
                <button type="button" aria-label={t('priority_high')} onClick={() => setPriority('high')} className={`px-3 py-1 rounded-md border text-xs ${priority==='high'?'bg-blue-50 border-blue-400 text-blue-700':'border-gray-200 text-gray-700'}`}>{t('priority_high')}</button>
              </div>
            </div>

            {/* Set Deadline Toggle Button */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowDeadlineFields(!showDeadlineFields);
                  if (showDeadlineFields) {
                    setStartTime(undefined);
                    setEndTime(undefined);
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('set_deadline')}
                <svg 
                  className={`w-4 h-4 transition-transform ${showDeadlineFields ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Date and Time - conditional rendering based on showDeadlineFields */}
            {showDeadlineFields && (
              <div className="space-y-3">
                {/* Start Date Label */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">{t('create_start_time_label')}</label>
                </div>
                {/* Start Row */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Start Date */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                      className="flex items-center gap-3 w-full p-2 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      aria-label={t('select_date')}
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-700">
                        {start_time ? formatDate(start_time) : t('select_date')}
                      </span>
                    </button>
                    {showStartDatePicker && (
                      <div className="absolute top-full left-0 mt-1 z-50">
                        <CalendarDatePicker
                          selectedDate={start_time ? new Date(start_time as any) : new Date()}
                          onDateSelect={(date: Date) => {
                            const currentTime = start_time ? new Date(start_time as any) : new Date();
                            date.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
                            setStartTime(date);
                            setShowStartDatePicker(false);
                          }}
                          isOpen={showStartDatePicker}
                          onClose={() => setShowStartDatePicker(false)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Start Time */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowStartTimePicker(!showStartTimePicker)}
                      className="flex items-center gap-2 w-full p-2 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      aria-label={t('start_time')}
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-gray-700">
                        {start_time ? formatTime(start_time) : t('start_time')}
                      </span>
                    </button>
                    {showStartTimePicker && (
                      <div className="absolute top-full left-0 mt-1 z-50">
                        <TimePickerDropdown
                          selectedTime={start_time ? formatTime(start_time) : ''}
                          onTimeSelect={(time: string) => {
                            const period = time.endsWith('pm') ? 'pm' : 'am';
                            const timeStr = time.slice(0, -2);
                            const [hoursStr, minutesStr] = timeStr.split(':');
                            let hours = parseInt(hoursStr, 10);
                            const minutes = parseInt(minutesStr, 10);
                            if (period === 'pm' && hours !== 12) hours += 12;
                            if (period === 'am' && hours === 12) hours = 0;
                            const currentDate = start_time ? new Date(start_time as any) : new Date();
                            currentDate.setHours(hours, minutes, 0, 0);
                            setStartTime(new Date(currentDate));
                            setShowStartTimePicker(false);
                          }}
                          isOpen={showStartTimePicker}
                          onClose={() => setShowStartTimePicker(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Deadline Label */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">{t('create_deadline_label')}</label>
                </div>

                {/* End Row */}
                <div className="grid grid-cols-2 gap-2">
                {/* End Date */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                    className="flex items-center gap-3 w-full p-2 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label={t('select_date')}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {end_time ? formatDate(end_time) : t('select_date')}
                    </span>
                  </button>
                  {showEndDatePicker && (
                    <div className="absolute top-full left-0 mt-1 z-50">
                      <CalendarDatePicker
                        selectedDate={end_time ? new Date(end_time as any) : (start_time ? new Date(start_time as any) : new Date())}
                        onDateSelect={(date: Date) => {
                          const currentTime = end_time ? new Date(end_time as any) : (start_time ? new Date(start_time as any) : new Date());
                          date.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
                          setEndTime(new Date(date));
                          setShowEndDatePicker(false);
                        }}
                        isOpen={showEndDatePicker}
                        onClose={() => setShowEndDatePicker(false)}
                      />
                    </div>
                  )}
                </div>

                {/* End Time */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                    className="flex items-center gap-2 w-full p-2 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label={t('end_time')}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-gray-700">
                      {end_time ? formatTime(end_time) : t('end_time')}
                    </span>
                  </button>
                  {showEndTimePicker && (
                    <div className="absolute top-full left-0 mt-1 z-50">
                      <TimePickerDropdown
                        selectedTime={end_time ? formatTime(end_time) : ''}
                        onTimeSelect={(time: string) => {
                          const period = time.endsWith('pm') ? 'pm' : 'am';
                          const timeStr = time.slice(0, -2);
                          const [hoursStr, minutesStr] = timeStr.split(':');
                          let hours = parseInt(hoursStr, 10);
                          const minutes = parseInt(minutesStr, 10);
                          if (period === 'pm' && hours !== 12) hours += 12;
                          if (period === 'am' && hours === 12) hours = 0;
                          const baseDate = end_time ? new Date(end_time as any) : (start_time ? new Date(start_time as any) : new Date());
                          baseDate.setHours(hours, minutes, 0, 0);
                          setEndTime(new Date(baseDate));
                          setShowEndTimePicker(false);
                        }}
                        isOpen={showEndTimePicker}
                        onClose={() => setShowEndTimePicker(false)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {errors.time && <div className="text-red-500 text-xs">{errors.time}</div>}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">{t('description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('add_description')}
                className="w-full p-3 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">{t('tags')}</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag._id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => handleTagSelect(tag)}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                      aria-label={t('remove_tag')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags
                  .filter(tag => !selectedTags.some(selected => selected._id === tag._id))
                  .map((tag) => (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => handleTagSelect(tag)}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => setShowNewTagForm(!showNewTagForm)}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  + {t('Add new tag')}
                </button>
              </div>
              {showNewTagForm && (
                <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder={t('Tag name')}
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      maxLength={20}
                      autoComplete="off"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-6 h-6 border border-gray-200 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-500">{t('Color')}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewTagForm(false);
                          setNewTagName('');
                          setNewTagColor('#3B82F6');
                        }}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (newTagName.trim()) {
                            await handleCreateNewTag(newTagName, newTagColor, () => {
                              setNewTagName('');
                              setNewTagColor('#3B82F6');
                              setShowNewTagForm(false);
                            });
                          }
                        }}
                        disabled={!newTagName.trim()}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('Add tag')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label={t('cancel')}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !title?.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={t('update_task')}
          >
            {isSubmitting ? t('saving') : t('update_task')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditTaskForm;