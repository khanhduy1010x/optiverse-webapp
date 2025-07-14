import React, { useState, useEffect } from 'react';
import { TaskEvent, RepeatType, RepeatEndType } from '../../types/task-events/task-events.types';
import { useTaskEventForm } from '../../hooks/task-events/useTaskEventForm.hook';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import Modal from 'react-modal';
import { GROUP_CLASSNAMES } from '../../styles';

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
      if (isEditMode && taskEvent) {
        // Get payload from hook and ensure all fields
        const payload = getUpdatePayload();
        
        // Ensure repeat_days if weekly or custom
        if ((payload.repeat_type === 'weekly' || payload.repeat_type === 'custom') && 
            (!payload.repeat_days || payload.repeat_days.length === 0)) {
          payload.repeat_days = [new Date(formData.start_time).getDay()];
        }
        
        // Ensure new fields added to backend
        if (payload.location === undefined) payload.location = '';
        if (payload.guests === undefined) payload.guests = [];
        if (payload.repeat_end_type === undefined) payload.repeat_end_type = 'never';
        if (payload.repeat_interval === undefined) payload.repeat_interval = 1;
        
        // Add fields based on repeat_end_type
        if (payload.repeat_end_type === 'on' && !payload.repeat_end_date) {
          const defaultEndDate = new Date(formData.start_time);
          defaultEndDate.setMonth(defaultEndDate.getMonth() + 3);
          payload.repeat_end_date = defaultEndDate;
        } else if (payload.repeat_end_type === 'after' && !payload.repeat_occurrences) {
          payload.repeat_occurrences = 10;
        }
        
        // Add color
        payload.color = selectedColor;
        
        console.log('Updating task event with payload:', payload);
        const result = await updateTaskEvent(taskEvent._id, payload);
        success = !!result;
      } else {
        // Get payload from hook and ensure all fields
        const payload = getCreatePayload();
        payload.task_id = taskId;
        
        // Ensure repeat_days if weekly or custom
        if ((payload.repeat_type === 'weekly' || payload.repeat_type === 'custom') && 
            (!payload.repeat_days || payload.repeat_days.length === 0)) {
          payload.repeat_days = [new Date(formData.start_time).getDay()];
        }
        
        // Ensure new fields added to backend
        if (payload.location === undefined) payload.location = '';
        if (payload.guests === undefined) payload.guests = [];
        if (payload.repeat_end_type === undefined) payload.repeat_end_type = 'never';
        if (payload.repeat_interval === undefined) payload.repeat_interval = 1;
        
        // Add fields based on repeat_end_type
        if (payload.repeat_end_type === 'on' && !payload.repeat_end_date) {
          const defaultEndDate = new Date(formData.start_time);
          defaultEndDate.setMonth(defaultEndDate.getMonth() + 3);
          payload.repeat_end_date = defaultEndDate;
        } else if (payload.repeat_end_type === 'after' && !payload.repeat_occurrences) {
          payload.repeat_occurrences = 10;
        }
        
        // Add color
        payload.color = selectedColor;
        
        console.log('Creating task event with payload:', payload);
        const result = await createTaskEvent(payload);
        success = !!result;
      }
      
      if (success) {
        resetForm();
        onSuccess();
        onClose();
      } else {
        console.error('Operation failed but no error was thrown');
        alert('Could not save event. Please try again later.');
      }
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      alert(`Error: ${err?.message || 'Could not save event'}`);
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
      className="fixed top-1/2 right-16 transform -translate-y-1/2 w-[360px] max-w-[90vw] bg-white rounded-xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/30 backdrop-blur-sm z-[2000]"
      onRequestClose={handleCancel}
      shouldCloseOnOverlayClick={false}
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit} className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-medium">{isEditMode ? 'Edit Event' : 'Add Event'}</h3>
          <button 
            type="button"
            onClick={handleCancel} 
            className="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Add title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full border-0 border-b border-gray-200 py-2 mb-4 focus:outline-none focus:ring-0 focus:border-gray-300 placeholder-gray-400"
          autoFocus
        />
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {getDayAndDate()}
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="time"
            className="border border-gray-200 rounded-md p-1.5 text-sm"
            value={formatTimeForInput(formData.start_time)}
            onChange={(e) => handleStartTimeChange(e.target.value)}
          />
          <span className="text-gray-400">→</span>
          <input
            type="time"
            className="border border-gray-200 rounded-md p-1.5 text-sm"
            value={formData.end_time ? formatTimeForInput(formData.end_time) : ''}
            onChange={(e) => handleEndTimeChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <input
            type="text"
            placeholder="Add guests"
            value={formData.guests?.join(', ') || ''}
            onChange={(e) => handleInputChange('guests', e.target.value.split(',').map(g => g.trim()))}
            className="w-full border-0 py-1 focus:outline-none focus:ring-0 text-sm"
          />
        </div>
        
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <input
            type="text"
            placeholder="Add location or URL"
            value={formData.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full border-0 py-1 focus:outline-none focus:ring-0 text-sm"
          />
        </div>
        
        <div className="flex items-center mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <input
            type="text"
            placeholder="Add description"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full border-0 py-1 focus:outline-none focus:ring-0 text-sm"
          />
        </div>
        
        {/* Repeat options */}
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setShowRepeatOptions(!showRepeatOptions)}
              className="w-full text-left py-1 text-sm flex justify-between items-center"
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
        </div>
        
        {/* All day checkbox */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="all-day"
            checked={formData.all_day || false}
            onChange={(e) => handleAllDayToggle(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="all-day" className="text-sm text-gray-700">All day</label>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <div 
              className={`w-6 h-6 rounded-full bg-blue-400 cursor-pointer ${selectedColor === '#3B82F6' ? 'ring-2 ring-gray-300' : ''}`}
              onClick={() => setSelectedColor('#3B82F6')}
            ></div>
            <div 
              className={`w-6 h-6 rounded-full bg-red-400 cursor-pointer ${selectedColor === '#F87171' ? 'ring-2 ring-gray-300' : ''}`}
              onClick={() => setSelectedColor('#F87171')}
            ></div>
            <div 
              className={`w-6 h-6 rounded-full bg-yellow-400 cursor-pointer ${selectedColor === '#FBBF24' ? 'ring-2 ring-gray-300' : ''}`}
              onClick={() => setSelectedColor('#FBBF24')}
            ></div>
            <div 
              className={`w-6 h-6 rounded-full bg-green-400 cursor-pointer ${selectedColor === '#10B981' ? 'ring-2 ring-gray-300' : ''}`}
              onClick={() => setSelectedColor('#10B981')}
            ></div>
            <div 
              className={`w-6 h-6 rounded-full bg-purple-400 cursor-pointer ${selectedColor === '#A78BFA' ? 'ring-2 ring-gray-300' : ''}`}
              onClick={() => setSelectedColor('#A78BFA')}
            ></div>
          </div>
          <div className="flex space-x-2">
            <button 
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:bg-blue-300"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}; 