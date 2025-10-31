import React, { useState } from 'react';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import Modal from 'react-modal';
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
    return !!task.end_time;
  });
  const [showAllTags, setShowAllTags] = useState(false);
  
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  const { t } = useAppTranslate('task');
  
  const TAGS_DISPLAY_LIMIT = 4;
  
  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    // Display date in English (US) for Start Time and Deadline
    return date.toLocaleDateString('en-US', {
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

  const formatTimeToHHmm = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
    
    if (end_time) {
      try {
        const endDate = end_time instanceof Date ? end_time : new Date(end_time);
        
        if (isNaN(endDate.getTime())) {
          newErrors.time = t('create_invalid_date');
          setErrors(newErrors);
          return false;
        }
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        if (endDateOnly < today) {
          newErrors.time = t('create_end_in_past');
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

    try {
      setIsSubmitting(true);
      setErrors({});
      
      const result = await onSave({
        title,
        description,
        status,
        priority,
        tags: selectedTags,
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
        
        {/* Header with Title Input and Close Button */}
        <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex-1">
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

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={t('close')}
            aria-label={t('close')}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">

            {/* Priority */}
            <div className="flex gap-2">
              <button 
                type="button" 
                aria-label={t('priority_low')} 
                onClick={() => setPriority('low')} 
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${priority==='low'?'bg-blue-50 border-blue-400 text-blue-700':'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                {t('priority_low')}
              </button>
              <button 
                type="button" 
                aria-label={t('priority_medium')} 
                onClick={() => setPriority('medium')} 
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${priority==='medium'?'bg-blue-50 border-blue-400 text-blue-700':'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                {t('priority_medium')}
              </button>
              <button 
                type="button" 
                aria-label={t('priority_high')} 
                onClick={() => setPriority('high')} 
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${priority==='high'?'bg-blue-50 border-blue-400 text-blue-700':'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                {t('priority_high')}
              </button>
            </div>

            {/* Set Deadline Toggle Button */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowDeadlineFields(!showDeadlineFields);
                  if (showDeadlineFields) {
                    setEndTime(undefined);
                  }
                }}
                className="flex items-center gap-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">{t('set_deadline')}</span>
                <svg 
                  className={`w-5 h-5 ml-auto transition-transform ${showDeadlineFields ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Deadline Fields - conditional rendering */}
            {showDeadlineFields && (
              <div className="space-y-3 pl-1">
                {/* End Date and Time Row */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">{t('create_deadline_label')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* End Date */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                        className="flex items-center gap-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        aria-label={t('select_date')}
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700">
                          {end_time ? formatDate(end_time) : t('select_date')}
                        </span>
                      </button>
                      {showEndDatePicker && (
                        <div className="absolute top-full left-0 mt-1 z-50">
                          <CalendarDatePicker
                            selectedDate={end_time ? new Date(end_time as any) : new Date()}
                            onDateSelect={(date: Date) => {
                              const currentTime = end_time ? new Date(end_time as any) : new Date();
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
                        className="flex items-center gap-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        aria-label={t('end_time')}
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700">
                          {end_time ? formatTime(end_time) : t('end_time')}
                        </span>
                      </button>
                      {showEndTimePicker && (
                        <div className="absolute top-full left-0 mt-1 z-50">
                          <TimePickerDropdown
                            selectedTime={end_time ? formatTimeToHHmm(end_time) : ''}
                            onTimeSelect={(time: string) => {
                              const [hours, minutes] = time.split(':').map(Number);
                              const baseDate = end_time ? new Date(end_time as any) : new Date();
                              baseDate.setHours(hours, minutes, 0, 0);
                              setEndTime(new Date(baseDate));
                              setShowEndTimePicker(false);
                            }}
                            isOpen={showEndTimePicker}
                            onClose={() => setShowEndTimePicker(false)}
                            format24h={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {errors.time && <div className="text-red-500 text-xs bg-red-50 p-2 rounded">{errors.time}</div>}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <textarea
                rows={3}
                placeholder={t('add_description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-3 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
              />
              {errors.description && <div className="text-red-500 text-xs">{errors.description}</div>}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">{t('tags')}</label>
              <div className="flex flex-wrap gap-2">
                {allTags?.slice(0, showAllTags ? allTags.length : TAGS_DISPLAY_LIMIT).map((tag) => {
                  const isSelected = selectedTags?.some((t) => t._id === tag._id);
                  return (
                    <button
                      type="button"
                      key={tag._id}
                      onClick={() => handleTagSelect(tag)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${isSelected ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      title={t('select_tag')}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>

              {/* Show more / Show less button */}
              {allTags && allTags.length > TAGS_DISPLAY_LIMIT && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {showAllTags ? t('show_less') : t('show_more')} ({allTags.length})
                </button>
              )}

              {/* Add new tag */}
              {!showNewTagForm ? (
                <button
                  type="button"
                  onClick={() => setShowNewTagForm(true)}
                  className="text-xs text-blue-600 hover:underline"
                  aria-label={t('add_new_tag')}
                >
                  {t('add_new_tag')}
                </button>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder={t('tag_name_placeholder')}
                    className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    aria-label={t('tag_color')}
                    className="w-10 h-10 p-1 border border-gray-200 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await handleCreateNewTag(newTagName, newTagColor, () => {
                        setNewTagName('');
                        setNewTagColor('#4f46e5');
                        setShowNewTagForm(false);
                      });
                    }}
                    className="text-xs px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    aria-label={t('save_tag')}
                  >
                    {t('save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewTagForm(false)}
                    className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    aria-label={t('cancel')}
                  >
                    {t('cancel')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t('cancel')}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !title?.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            aria-label={t('save')}
          >
            {isSubmitting ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditTaskForm;