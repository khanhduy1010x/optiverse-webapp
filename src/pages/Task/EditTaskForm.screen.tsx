import React, { useState } from 'react';
import { GROUP_CLASSNAMES } from '../../styles';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import Modal from 'react-modal';
import { isoToLocalDateTime, localDateTimeToISO } from '../../utils/date.utils';

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
    
    // Validate title
    if (!title || !title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 50) {
      newErrors.title = 'Title cannot exceed 50 characters';
    }
    
    // Validate description
    if (description && description.length > 150) {
      newErrors.description = 'Description cannot exceed 150 characters';
    }
    
    // Validate times
    if (start_time && end_time) {
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      const now = new Date();
      
      // Check if dates are in the past
      if (startDate < now) {
        newErrors.time = 'Start time cannot be in the past';
        return false;
      }
      
      // Check if end time is after start time
      if (endDate <= startDate) {
        newErrors.time = 'Deadline must be after start time';
        return false;
      }
    } else if (start_time) {
      const startDate = new Date(start_time);
      const now = new Date();
      
      // Check if start date is in the past
      if (startDate < now) {
        newErrors.time = 'Start time cannot be in the past';
        return false;
      }
    } else if (end_time) {
      const endDate = new Date(end_time);
      const now = new Date();
      
      // Check if end date is in the past
      if (endDate < now) {
        newErrors.time = 'Deadline cannot be in the past';
        return false;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Validate form before submission
    // if (!validateForm()) {
    //   return;
    // }

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
        status,
        priority,
        tags: selectedTags,
        start_time,
        end_time
      });
      
      // Call onSave and wait for result
      const result = await onSave({
        title,
        description,
        status,
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
        setErrors({ general: 'Failed to save task. Please try again.' });
      }
    } catch (error) {
      console.error('EditTaskForm: Error saving task:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to save task. Please try again.' 
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
            placeholder="Task name"
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
          <div className="text-xs text-gray-400 mt-1">{title.length}/50 characters</div>
        </div>

        {/* Description */}
        <div className={GROUP_CLASSNAMES.taskDetailDescription}>
          <textarea
            className={`w-full text-sm border-0 p-0 focus:outline-none focus:ring-0 placeholder-gray-400 resize-none ${errors.description ? 'border border-red-500' : ''}`}
            placeholder="Description"
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
          <div className="text-xs text-gray-400 mt-1">{description.length}/150 characters</div>
        </div>

        <div className={GROUP_CLASSNAMES.taskDetailSection}>
          <div className="space-y-2">
            {/* Status */}
            <div className={GROUP_CLASSNAMES.flexItemsCenter + ' py-2'}>
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <select
                aria-label="Task status"
                className="flex-grow border-0 bg-transparent focus:outline-none focus:ring-0 text-sm text-gray-700"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                autoComplete="off"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Priority */}
            <div className={GROUP_CLASSNAMES.flexItemsCenter + ' py-2'}>
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <select
                aria-label="Task priority"
                className="flex-grow border-0 bg-transparent focus:outline-none focus:ring-0 text-sm text-gray-700"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                autoComplete="off"
              >
                <option value="low">Low (P3)</option>
                <option value="medium">Medium (P2)</option>
                <option value="high">High (P1)</option>
              </select>
            </div>

            {/* Start Time */}
            <div className={GROUP_CLASSNAMES.flexItemsCenter + ' py-2'}>
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="flex-grow">
                <label className="text-sm text-gray-500 block mb-1">Start Time</label>
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
                <label className="text-sm text-gray-500 block mb-1">Deadline</label>
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
                          aria-label="Remove tag"
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
                    + Select tags
                  </button>
                  {showNewTagForm && (
                    <div className="fixed top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-64 bg-white rounded-md shadow-xl z-50 max-h-96 overflow-y-auto border border-gray-200">
                      <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <span className="font-medium">Select Tags</span>
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
                        <div className="px-4 py-3 text-sm text-gray-500">No tags available. Please create tags in the tag management section.</div>
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
                          + Create new tag
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
            Cancel
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
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={GROUP_CLASSNAMES.taskModalCloseButton}
          aria-label="Close task edit form"
          title="Close task edit form"
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