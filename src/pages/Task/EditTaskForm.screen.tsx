import React, { useState } from 'react';
import { GROUP_CLASSNAMES } from '../../styles';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import Modal from 'react-modal';
import { isoToLocalDateTime, localDateTimeToISO } from '../../utils/date.utils';
import { useAppTranslate } from '../../hooks/useAppTranslate';

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
  const { t } = useAppTranslate('task');
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
    
    // Debug logging
    console.log('=== EditTaskForm Validation Debug ===');
    console.log('Input values:', {
      title,
      description,
      start_time,
      end_time,
      start_time_type: typeof start_time,
      end_time_type: typeof end_time
    });
    
    // Validate title
    if (!title || !title.trim()) {
      newErrors.title = t('create_required_title');
    } else if (title.length > 50) {
      newErrors.title = t('create_title_max');
    }
    
    // Validate description
    if (description && description.length > 150) {
      newErrors.description = t('create_desc_max');
    }
    
    // Validate times
    if (start_time && end_time) {
      try {
        // Convert to Date objects, handling both string and Date types
        const startDate = start_time instanceof Date ? start_time : new Date(start_time);
        const endDate = end_time instanceof Date ? end_time : new Date(end_time);
        
        console.log('Date conversion:', {
          start_time_original: start_time,
          startDate: startDate.toString(),
          startDate_valid: !isNaN(startDate.getTime()),
          end_time_original: end_time,
          endDate: endDate.toString(),
          endDate_valid: !isNaN(endDate.getTime())
        });
        
        // Check if dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          newErrors.time = t('create_invalid_date');
          console.log('Date validation failed: Invalid date format');
          setErrors(newErrors);
          return false;
        }
        
        // Get current date without time (just date part) for fair comparison
      const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Convert dates to date-only for comparison (ignore time)
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        console.log('Date comparison:', {
          now: now.toString(),
          today: today.toString(),
          startDateOnly: startDateOnly.toString(),
          endDateOnly: endDateOnly.toString(),
          startDateOnly_vs_today: startDateOnly < today,
          endDateOnly_vs_today: endDateOnly < today,
          endDate_vs_startDate: endDate <= startDate
        });
        
        // Check if start date is in the past (date only)
        if (startDateOnly < today) {
          newErrors.time = t('create_start_in_past');
          console.log('Date validation failed: Start date in past');
          setErrors(newErrors);
        return false;
      }
      
        // Check if end date is before start date
      if (endDate <= startDate) {
        newErrors.time = t('create_deadline_after_start');
          console.log('Date validation failed: End date before start date');
          setErrors(newErrors);
          return false;
        }
        
        console.log('Date validation passed for both dates');
      } catch (error) {
        console.error('Error validating dates:', error);
        newErrors.time = t('create_invalid_date');
        setErrors(newErrors);
        return false;
      }
    } else if (start_time) {
      try {
        const startDate = start_time instanceof Date ? start_time : new Date(start_time);
        
        console.log('Start date only validation:', {
          start_time_original: start_time,
          startDate: startDate.toString(),
          startDate_valid: !isNaN(startDate.getTime())
        });
        
        if (isNaN(startDate.getTime())) {
          newErrors.time = t('create_invalid_start_date');
          console.log('Date validation failed: Invalid start date format');
          setErrors(newErrors);
          return false;
        }
        
        // Get current date without time
      const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        
        console.log('Start date comparison:', {
          now: now.toString(),
          today: today.toString(),
          startDateOnly: startDateOnly.toString(),
          startDateOnly_vs_today: startDateOnly < today
        });
        
        if (startDateOnly < today) {
          newErrors.time = t('create_start_in_past');
          console.log('Date validation failed: Start date in past');
          setErrors(newErrors);
          return false;
        }
        
        console.log('Start date validation passed');
      } catch (error) {
        console.error('Error validating start date:', error);
        newErrors.time = t('create_invalid_start_date');
        setErrors(newErrors);
        return false;
      }
    } else if (end_time) {
      try {
        const endDate = end_time instanceof Date ? end_time : new Date(end_time);
        
        console.log('End date only validation:', {
          end_time_original: end_time,
          endDate: endDate.toString(),
          endDate_valid: !isNaN(endDate.getTime())
        });
        
        if (isNaN(endDate.getTime())) {
          newErrors.time = t('create_invalid_end_date');
          console.log('Date validation failed: Invalid end date format');
          setErrors(newErrors);
          return false;
        }
        
        // Get current date without time
      const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        console.log('End date comparison:', {
          now: now.toString(),
          today: today.toString(),
          endDateOnly: endDateOnly.toString(),
          endDateOnly_vs_today: endDateOnly < today
        });
        
        if (endDateOnly < today) {
          newErrors.time = t('create_end_in_past');
          console.log('Date validation failed: End date in past');
          setErrors(newErrors);
          return false;
        }
        
        console.log('End date validation passed');
      } catch (error) {
        console.error('Error validating end date:', error);
        newErrors.time = t('create_invalid_end_date');
        setErrors(newErrors);
        return false;
      }
    }
    
    console.log('Final validation result:', {
      errors: newErrors,
      hasErrors: Object.keys(newErrors).length > 0
    });
    console.log('=== End Validation Debug ===');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Auto-update status if overdue and new deadline is in the future
    let newStatus = status;
    if (
      status === 'overdue' && end_time
    ) {
      const endDate = end_time instanceof Date ? end_time : new Date(end_time);
      if (!isNaN(endDate.getTime()) && endDate > new Date()) {
        newStatus = 'pending';
        setStatus('pending');
      }
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      
      // Log date values for debugging
      console.log('EditTaskForm - Date values before submission:', {
        start_time_original: start_time,
        start_time_formatted: start_time ? (start_time instanceof Date ? start_time.toISOString() : localDateTimeToISO(start_time)) : undefined,
        end_time_original: end_time,
        end_time_formatted: end_time ? (end_time instanceof Date ? end_time.toISOString() : localDateTimeToISO(end_time)) : undefined
      });
      
      console.log('EditTaskForm: Saving task with data:', {
        title,
        description,
        status: newStatus,
        priority,
        tags: selectedTags,
        start_time,
        end_time
      });
      
      // Call onSave and wait for result
      const result = await onSave({
        title,
        description,
        status: newStatus,
        priority,
      tags: selectedTags,
        start_time,
        end_time
      });
      
      console.log('EditTaskForm: Save result:', result);
      
      // Close form after successful save
      if (result !== false) {
        console.log('EditTaskForm: Save successful, closing form');
        onClose();
      } else {
        console.error('EditTaskForm: Save returned false');
        setErrors({ general: t('error_failed_save') });
      }
    } catch (error) {
      console.error('EditTaskForm: Error saving task:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : t('error_failed_save') 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
    >       <div className={GROUP_CLASSNAMES.taskModalContent + ' border border-gray-200'}>
        {/* Task name */}
        <div className={GROUP_CLASSNAMES.taskDetailHeader}>
          <input
            className={`w-full text-xl font-medium border-0 p-0 mb-2 focus:outline-none focus:ring-0 placeholder-gray-400 ${errors.title ? 'border-b border-red-500' : ''}`}
            type="text"
            placeholder={t('create_task_name_placeholder')}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors(prev => ({ ...prev, title: undefined }));
              }
            }}
            autoFocus
            autoComplete="off"
            maxLength={50}
          />
          {errors.title && (
            <div className="text-red-500 text-xs mt-1">{errors.title}</div>
          )}
          <div className="text-xs text-gray-400 mt-1">{title.length}/50 {t('characters')}</div>
        </div>

        {/* Description */}
        <div className={GROUP_CLASSNAMES.taskDetailDescription}>
          <textarea
            className={`w-full text-sm border-0 p-0 focus:outline-none focus:ring-0 placeholder-gray-400 resize-none ${errors.description ? 'border border-red-500' : ''}`}
            placeholder={t('create_description_placeholder')}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) {
                setErrors(prev => ({ ...prev, description: undefined }));
              }
            }}
            rows={1}
            autoComplete="off"
            maxLength={150}
          />
          {errors.description && (
            <div className="text-red-500 text-xs mt-1">{errors.description}</div>
          )}
          <div className="text-xs text-gray-400 mt-1">{description.length}/150 {t('characters')}</div>
        </div>

        <div className={GROUP_CLASSNAMES.taskDetailSection}>
          <div className="space-y-2">
            {/* Priority */}
            <div className={GROUP_CLASSNAMES.flexItemsCenter + ' py-2'}>
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <select
                aria-label={t('create_priority_aria')}
                className="flex-grow border-0 bg-transparent focus:outline-none focus:ring-0 text-sm text-gray-700"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                autoComplete="off"
              >
                <option value="low">{t('priority_low')}</option>
                <option value="medium">{t('priority_medium')}</option>
                <option value="high">{t('priority_high')}</option>
              </select>
            </div>

            {/* Start Time */}
            <div className={GROUP_CLASSNAMES.flexItemsCenter + ' py-2'}>
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="flex-grow">
                <label className="text-sm text-gray-500 block mb-1">{t('create_start_time_label')}</label>
                <input
                  type="datetime-local"
                  className={`w-full border border-gray-200 rounded px-2 py-1 text-sm ${errors.time ? 'border-red-500' : ''}`}
                  value={isoToLocalDateTime(start_time || '')}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (errors.time) {
                      setErrors(prev => ({ ...prev, time: undefined }));
                    }
                  }}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* End Time (Deadline) */}
            <div className={GROUP_CLASSNAMES.flexItemsCenter + ' py-2'}>
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-grow">
                <label className="text-sm text-gray-500 block mb-1">{t('create_deadline_label')}</label>
                <input
                  type="datetime-local"
                  className={`w-full border border-gray-200 rounded px-2 py-1 text-sm ${errors.time ? 'border-red-500' : ''}`}
                  value={isoToLocalDateTime(end_time || '')}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    if (errors.time) {
                      setErrors(prev => ({ ...prev, time: undefined }));
                    }
                  }}
                  autoComplete="off"
                />
              </div>
            </div>
            {errors.time && (
              <div className="text-red-500 text-xs mt-1 ml-8">{errors.time}</div>
            )}

            {/* Tags */}
            <div className={GROUP_CLASSNAMES.flexItemsCenter + ' py-2'}>
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <div className="flex-grow">
                <div className={GROUP_CLASSNAMES.tagContainer + ' mb-2'}>
                  {selectedTags.length === 0 ? (
                    <></>
                  ) : (
                    selectedTags.map(tag => (
                      <span
                        key={tag._id || `temp-${tag.name}-${Math.random().toString(36).substr(2, 9)}`}
                        className={GROUP_CLASSNAMES.tagItem}
                        style={{
                          backgroundColor: `${tag.color}15`,
                          color: tag.color
                        }}
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => handleTagSelect(tag)}
                          className="ml-1 focus:outline-none"
                          aria-label={t('create_remove_tag')}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNewTagForm(!showNewTagForm)}
                    className="text-xs text-blue-500 hover:text-blue-700 focus:outline-none"
                  >
                    + {t('create_select_tags')}
                  </button>
                  {showNewTagForm && (
                    <div className="fixed top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-64 bg-white rounded-md shadow-xl z-50 max-h-96 overflow-y-auto border border-gray-200">
                      <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <span className="font-medium">{t('create_select_tags')}</span>
                        <button
                          onClick={() => setShowNewTagForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {allTags.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">{t('create_no_tags_available')}</div>
                      ) : (
                        <div className="py-2">
                          {allTags.map(tag => {
                            const isSelected = selectedTags.some(t =>
                              (t._id && tag._id && t._id === tag._id) ||
                              (t.name && tag.name && t.name === tag.name)
                            );
                            return (
                              <div
                                key={tag._id || `temp-${tag.name}-${Math.random().toString(36).substr(2, 9)}`}
                                className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-gray-100' : ''}`}
                                onClick={() => handleTagSelect(tag)}
                              >
                                <div className={GROUP_CLASSNAMES.flexItemsCenter}>
                                  <span
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: tag.color }}
                                  ></span>
                                  {tag.name}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="sticky bottom-0 bg-white px-4 py-3 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            // Create a new tag form
                            setNewTagName('');
                            setNewTagColor('#3B82F6'); // Default blue color
                            setShowNewTagForm(false);
                            // Show the new tag form
                            // This would typically open another modal or form component
                          }}
                          className="text-xs text-blue-500 hover:text-blue-700 focus:outline-none"
                        >
                          {t('create_new_tag')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className={GROUP_CLASSNAMES.taskDetailFooter}>
          {errors.general && (
            <div className="text-red-500 text-sm mb-2 w-full text-center">
              {errors.general}
            </div>
          )}
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('saving')}
              </>
            ) : (
              t('save')
            )}
          </button>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={GROUP_CLASSNAMES.taskModalCloseButton}
          aria-label={t('edit_close_aria')}
          title={t('edit_close_title')}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Modal>
  );
};

export default EditTaskForm; 