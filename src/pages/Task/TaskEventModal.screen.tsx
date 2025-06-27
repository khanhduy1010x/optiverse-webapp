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
    
    if (isEditMode && taskEvent) {
      const payload = getUpdatePayload();
      const result = await updateTaskEvent(taskEvent._id, payload);
      success = !!result;
    } else {
      const payload = getCreatePayload();
      payload.task_id = taskId;
      const result = await createTaskEvent(payload);
      success = !!result;
    }
    
    if (success) {
      resetForm();
      onSuccess();
      onClose();
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  const formatDateTimeForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const handleDateChange = (date: string) => {
    const newDate = new Date(formData.start_time);
    const [year, month, day] = date.split('-').map(Number);
    newDate.setFullYear(year, month - 1, day);
    handleInputChange('start_time', newDate);
    
    // Update end date as well if it's the same day
    if (formData.end_time) {
      const endDate = new Date(formData.end_time);
      const startDate = new Date(formData.start_time);
      if (endDate.getDate() === startDate.getDate() && 
          endDate.getMonth() === startDate.getMonth() && 
          endDate.getFullYear() === startDate.getFullYear()) {
        const newEndDate = new Date(endDate);
        newEndDate.setFullYear(year, month - 1, day);
        handleInputChange('end_time', newEndDate);
      }
    }
  };

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

  const handleStartDateTimeChange = (dateTime: string) => {
    const newDate = new Date(dateTime);
    handleInputChange('start_time', newDate);
  };

  const handleEndDateTimeChange = (dateTime: string) => {
    const newDate = new Date(dateTime);
    handleInputChange('end_time', newDate);
  };

  const handleAllDayChange = (checked: boolean) => {
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

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen}
      className="fixed top-1/2 right-16 transform -translate-y-1/2 w-[360px] max-w-[90vw] bg-white rounded-xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
      onRequestClose={handleCancel}
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-medium">Add Schedule</h3>
          <button 
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
          placeholder="New event title"
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
            placeholder="Add Guest"
            className="w-full border-0 py-1 focus:outline-none focus:ring-0 text-sm"
          />
        </div>
        
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <input
            type="text"
            placeholder="https://meet.google.com/abc"
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
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-400"></div>
            <div className="w-6 h-6 rounded-full bg-red-400"></div>
            <div className="w-6 h-6 rounded-full bg-yellow-400"></div>
            <div className="w-6 h-6 rounded-full bg-green-400"></div>
            <div className="w-6 h-6 rounded-full bg-purple-400"></div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              disabled={loading || !formData.title.trim()}
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}; 