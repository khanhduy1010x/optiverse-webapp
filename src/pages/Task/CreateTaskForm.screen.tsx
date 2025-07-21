import React, { useState } from 'react';
import { GROUP_CLASSNAMES } from '../../styles';
import Modal from 'react-modal';
import { CreateTaskFormProps } from '../../types/task/props/component.props';
import { isoToLocalDateTime, localDateTimeToISO } from '../../utils/date.utils';

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    start_time,
    setStartTime,
    end_time,
    setEndTime,
    onClose,
    onSave,
    selectedTags,
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
    // Add errors state object for validation
    const [errors, setErrors] = useState<{
        title?: string;
        description?: string;
        time?: string;
    }>({});

    const validateForm = (): boolean => {
        const newErrors: {
            title?: string;
            description?: string;
            time?: string;
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
            try {
                // Convert to Date objects, handling both string and Date types
                const startDate = start_time instanceof Date ? start_time : new Date(start_time);
                const endDate = end_time instanceof Date ? end_time : new Date(end_time);
                
                // Check if dates are valid
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    newErrors.time = 'Invalid date format';
                    setErrors(newErrors);
                    return false;
                }
                
                // Get current date without time (just date part) for fair comparison
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                // Convert dates to date-only for comparison (ignore time)
                const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                
                // Check if start date is in the past (date only)
                if (startDateOnly < today) {
                    newErrors.time = 'Start date cannot be in the past';
                    setErrors(newErrors);
                    return false;
                }
                
                // Check if end date is before start date
                if (endDate <= startDate) {
                    newErrors.time = 'Deadline must be after start time';
                    setErrors(newErrors);
                    return false;
                }
            } catch (error) {
                console.error('Error validating dates:', error);
                newErrors.time = 'Invalid date format';
                setErrors(newErrors);
                return false;
            }
        } else if (start_time) {
            try {
                const startDate = start_time instanceof Date ? start_time : new Date(start_time);
                
                if (isNaN(startDate.getTime())) {
                    newErrors.time = 'Invalid start date format';
                    setErrors(newErrors);
                    return false;
                }
                
                // Get current date without time
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                
                if (startDateOnly < today) {
                    newErrors.time = 'Start date cannot be in the past';
                    setErrors(newErrors);
                    return false;
                }
            } catch (error) {
                console.error('Error validating start date:', error);
                newErrors.time = 'Invalid start date format';
                setErrors(newErrors);
                return false;
            }
        } else if (end_time) {
            try {
                const endDate = end_time instanceof Date ? end_time : new Date(end_time);
                
                if (isNaN(endDate.getTime())) {
                    newErrors.time = 'Invalid end date format';
                    setErrors(newErrors);
                    return false;
                }
                
                // Get current date without time
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                
                if (endDateOnly < today) {
                    newErrors.time = 'End date cannot be in the past';
                    setErrors(newErrors);
                    return false;
                }
            } catch (error) {
                console.error('Error validating end date:', error);
                newErrors.time = 'Invalid end date format';
                setErrors(newErrors);
                return false;
            }
        }
        
        // In ra log để debug
        console.log('Validation check:', {
            start_time,
            end_time,
            errors: newErrors
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateTask = async () => {
        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);
            
            
            // Gọi hàm onSave và đợi kết quả
            const success = await onSave({
                title,
                description,
                priority,
                tags: selectedTags,
                start_time,
                end_time
            });
            
            if (success) {
                // Đóng form sau khi lưu thành công
                onClose();
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={true}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
        >            
            <div className={GROUP_CLASSNAMES.taskModalContent}>
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
                    {/* Task attributes */}
                    <div className="space-y-2">
                        {/* Priority */}
                        <div className={GROUP_CLASSNAMES.flexItemsCenter + " py-2"}>
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
                        <div className={GROUP_CLASSNAMES.flexItemsCenter + " py-2"}>
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
                        <div className={GROUP_CLASSNAMES.flexItemsCenter + " py-2"}>
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
                        <div className={GROUP_CLASSNAMES.flexItemsCenter + " py-2"}>
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <div className="flex-grow">
                                <div className={GROUP_CLASSNAMES.tagContainer + " mb-2"}>
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
                                                                        className="w-4 h-4 rounded-full mr-2"
                                                                        style={{ backgroundColor: tag.color }}
                                                                    ></span>
                                                                    <span>{tag.name}</span>
                                                                    {isSelected && (
                                                                        <svg className="w-4 h-4 ml-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className={GROUP_CLASSNAMES.taskModalFooter}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm text-gray-500 hover:text-gray-700"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleCreateTask}
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
                                Creating...
                            </>
                        ) : (
                            'Create Task'
                        )}
                    </button>
                </div>

                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    className={GROUP_CLASSNAMES.taskModalCloseButton}
                    aria-label="Close task creation form"
                    title="Close task creation form"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </Modal>
    );
};

export default CreateTaskForm; 