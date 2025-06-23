import React, { useState } from 'react';
import { TaskEvent, RepeatType, RepeatEndType } from '../../types/task-events/task-events.types';
import { useTaskEventForm } from '../../hooks/task-events/useTaskEventForm.hook';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import { formatTimeToAMPM } from '../../utils/date.utils';

interface TaskEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskEvent?: TaskEvent;
  onSuccess: () => void;
}

export const TaskEventModal: React.FC<TaskEventModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskEvent,
  onSuccess,
}) => {
  const isEditMode = Boolean(taskEvent);
  const { formData, handleInputChange, resetForm, getCreatePayload, getUpdatePayload } = useTaskEventForm(taskEvent);
  const { createTaskEvent, updateTaskEvent, loading, error } = useTaskEventOperations();

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

  const handleEndDateChange = (date: string) => {
    if (!formData.end_time) {
      const newEndDate = new Date(date);
      const startTime = new Date(formData.start_time);
      newEndDate.setHours(startTime.getHours() + 1, startTime.getMinutes());
      handleInputChange('end_time', newEndDate);
      return;
    }
    
    const newDate = new Date(formData.end_time);
    const [year, month, day] = date.split('-').map(Number);
    newDate.setFullYear(year, month - 1, day);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">{isEditMode ? 'Edit event' : 'Add event'}</h2>
          <button 
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Title */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Add title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 text-lg border-b border-gray-300 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
          
          {/* Date and time */}
          <div className="mb-4 flex items-start">
            <div className="mr-3 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <input
                  type="date"
                  value={formatDateForInput(formData.start_time)}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="p-2 bg-gray-100 rounded border border-gray-300"
                />
                
                {!formData.all_day && (
                  <div className="flex items-center">
                    <input
                      type="time"
                      value={formatTimeForInput(formData.start_time)}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="p-2 bg-gray-100 rounded border border-gray-300"
                    />
                    <span className="ml-1 text-sm text-gray-500">({formatTimeToAMPM(formData.start_time)})</span>
                  </div>
                )}
                
                <span className="mx-2 text-gray-500">–</span>
                
                {formData.end_time && !formData.all_day && (
                  <>
                    {formData.start_time.toDateString() !== formData.end_time.toDateString() && (
                      <input
                        type="date"
                        value={formatDateForInput(formData.end_time)}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="p-2 bg-gray-100 rounded border border-gray-300"
                      />
                    )}
                    <div className="flex items-center">
                      <input
                        type="time"
                        value={formatTimeForInput(formData.end_time)}
                        onChange={(e) => handleEndTimeChange(e.target.value)}
                        className="p-2 bg-gray-100 rounded border border-gray-300"
                      />
                      <span className="ml-1 text-sm text-gray-500">({formatTimeToAMPM(formData.end_time)})</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="all-day"
                  checked={formData.all_day}
                  onChange={(e) => handleAllDayChange(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="all-day" className="text-sm text-gray-700">All day</label>
                
                <div className="ml-4">
                  <select
                    value={formData.repeat_type}
                    onChange={(e) => handleInputChange('repeat_type', e.target.value as RepeatType)}
                    className="bg-gray-100 p-1 rounded border border-gray-300 text-sm text-gray-700"
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekday">Weekdays</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="mb-4 flex items-center">
            <div className="mr-3 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Add location"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* Description */}
          <div className="mb-6 flex items-start">
            <div className="mr-3 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <textarea
              placeholder="Add description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 min-h-[60px] resize-none"
            />
          </div>
          
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          
          {/* Footer */}
          <div className="flex justify-end border-t pt-4 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 