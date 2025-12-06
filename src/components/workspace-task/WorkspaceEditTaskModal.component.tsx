import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { updateTask, getTasksByWorkspace } from '../../store/slices/workspace_task.slice';
import { UserDetailDto } from '../../types/workspace/response/workspace.response';
import workspaceService from '../../services/workspace.service';
import { WorkspaceCalendarDatePicker } from './WorkspaceCalendarDatePicker.component';
import { WorkspaceTimePickerDropdown } from './WorkspaceTimePickerDropdown.component';

interface WorkspaceEditTaskModalProps {
  task: WorkspaceTask;
  workspaceId: string;
  onClose: () => void;
}

const WorkspaceEditTaskModal: React.FC<WorkspaceEditTaskModalProps> = ({ task, workspaceId, onClose }) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assignedTo, setAssignedTo] = useState<string>(task.assigned_to || '');
  const [assignedToList, setAssignedToList] = useState<string[]>(task.assigned_to_list || []);
  const [endTime, setEndTime] = useState<Date | null>(task.end_time ? new Date(task.end_time) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<UserDetailDto[]>([]);
  const [showDeadlineFields, setShowDeadlineFields] = useState(!!task.end_time);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [tempTimeCleared, setTempTimeCleared] = useState(false);
  const [inputTimeValue, setInputTimeValue] = useState('');
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  // Close assignee dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false);
      }
    };

    if (showAssigneeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAssigneeDropdown]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const workspaceDetail = await workspaceService.getWorkspaceById(workspaceId);
        const activeMembersArray = workspaceDetail?.members?.active || [];
        setMembers(activeMembersArray);
      } catch (err) {
        console.error('Failed to fetch workspace members:', err);
        setMembers([]);
      }
    };

    if (workspaceId) {
      fetchMembers();
    }
  }, [workspaceId]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Parse time string (HH:mm) to get hours and minutes
  const parseTimeString = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  };

  // Validate time format
  const validateTimeInput = (value: string): boolean => {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError(t('task_title_required') || 'Task title is required');
      return;
    }

    setLoading(true);
    try {
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();

      const updatePayload = {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        assigned_to_list: assignedToList.length > 0 ? assignedToList : undefined,
        end_time: endTime ? endTime.toISOString() : undefined,
      };
      
      console.log('[WorkspaceEditTaskModal] Submitting update:', {
        taskId: task._id,
        payload: updatePayload,
        endTimeRaw: endTime,
        endTimeIso: endTime ? endTime.toISOString() : undefined,
      });

      await dispatch(
        updateTask({
          workspaceId,
          taskId: task._id,
          data: updatePayload,
        }),
      ).unwrap();

      // Refetch tasks after update
      try {
        await dispatch(getTasksByWorkspace(workspaceId)).unwrap();
      } catch (refetchErr) {
        console.warn('Failed to refetch tasks, but task was updated successfully:', refetchErr);
      }
      
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update task';
      setError(errorMessage);
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] my-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 flex items-start justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.substring(0, 100))}
            placeholder="Add title"
            maxLength={100}
            className="flex-1 text-lg font-semibold border-0 outline-none py-0 px-0 text-gray-900 placeholder-gray-400"
            disabled={loading}
            autoFocus
            required
          />
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="ml-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <span className="text-red-600 font-medium text-sm">⚠️</span>
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {/* Assignee Section - Custom Dropdown with Avatars */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign to</label>
            <div className="relative" ref={assigneeDropdownRef}>
              {/* Dropdown Button */}
              <button
                type="button"
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                  {assignedToList.length > 0 ? (
                    <>
                      {assignedToList.slice(0, 2).map((memberId) => {
                        const member = members.find(m => m.user_id === memberId);
                        return (
                          <div key={memberId} className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {member?.avatar_url ? (
                                <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <span>{member?.full_name?.[0]?.toUpperCase() || '?'}</span>
                              )}
                            </div>
                            <span className="text-xs font-medium text-gray-700 truncate">{member?.full_name}</span>
                          </div>
                        );
                      })}
                      {assignedToList.length > 2 && (
                        <span className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-100 rounded-full">
                          +{assignedToList.length - 2} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No one assigned</span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showAssigneeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showAssigneeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden">
                  {/* Members list */}
                  <div className="max-h-64 overflow-y-auto">
                    {members && members.length > 0 ? (
                      members.map((member) => {
                        const isSelected = assignedToList.includes(member.user_id);
                        return (
                          <button
                            key={member.user_id}
                            type="button"
                            onClick={() => {
                              setAssignedToList(prev =>
                                prev.includes(member.user_id)
                                  ? prev.filter(id => id !== member.user_id)
                                  : [...prev, member.user_id]
                              );
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                            }`}
                          >
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {member.avatar_url ? (
                                <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <span>{member.full_name?.[0]?.toUpperCase() || '?'}</span>
                              )}
                            </div>

                            {/* Member Info */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                                {member.full_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{member.email}</p>
                            </div>

                            {/* Selected indicator */}
                            {isSelected && (
                              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-2.5 text-sm text-gray-500 text-center">
                        No members available
                      </div>
                    )}
                  </div>
                </div>
              )}

              {members.length === 0 && !showAssigneeDropdown && (
                <p className="text-xs text-gray-500 mt-1">Loading members...</p>
              )}
            </div>
          </div>

          {/* Set Deadline Toggle Button */}
          <div>
            <button
              type="button"
              onClick={() => {
                const newState = !showDeadlineFields;
                setShowDeadlineFields(newState);
                // When opening deadline fields, set current date/time if not already set
                if (newState && !endTime) {
                  setEndTime(new Date());
                  setTempTimeCleared(false);
                }
              }}
              className="flex items-center gap-2 px-0 py-0 text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Set deadline
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

          {/* Deadline Fields */}
          {showDeadlineFields && (
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-gray-700">Deadline</label>
              <div className="grid grid-cols-2 gap-2">
                {/* End Date */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                    className="flex items-center gap-2 w-full p-2 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    aria-label="Select deadline date"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">
                      {endTime ? formatDate(endTime) : 'Select date'}
                    </span>
                  </button>
                  {showEndDatePicker && (
                    <div className="absolute top-full left-0 mt-1 z-50">
                      <WorkspaceCalendarDatePicker
                        selectedDate={endTime || new Date()}
                        onDateSelected={(date) => {
                          const currentTime = endTime || new Date();
                          date.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
                          setEndTime(new Date(date));
                          setTempTimeCleared(false); // Reset flag when date is selected
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
                  <input
                    type="text"
                    value={inputTimeValue || (tempTimeCleared ? '' : (endTime ? formatTime(endTime) : ''))}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInputTimeValue(value);
                      
                      // Allow clearing
                      if (!value) {
                        setTempTimeCleared(true);
                        setShowEndTimePicker(false);
                        return;
                      }
                      
                      // Validate and update if valid format
                      if (validateTimeInput(value)) {
                        setTempTimeCleared(false);
                        const { hours, minutes } = parseTimeString(value);
                        const baseDate = endTime || new Date();
                        baseDate.setHours(hours, minutes, 0, 0);
                        setEndTime(new Date(baseDate));
                      }
                    }}
                    onFocus={() => {
                      setShowEndTimePicker(true);
                      // Only clear if showing formatted time (not currently typing)
                      if (!inputTimeValue) {
                        setInputTimeValue('');
                      }
                    }}
                    onBlur={() => {
                      // Clear input value on blur to show formatted time
                      setTimeout(() => {
                        setInputTimeValue('');
                        setShowEndTimePicker(false);
                      }, 200);
                    }}
                    placeholder="HH:mm"
                    className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-md font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    maxLength={5}
                    aria-label="Enter deadline time"
                  />
                  {/* Clock Icon */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  {/* Dropdown Time Picker */}
                  {showEndTimePicker && (
                    <div className="absolute top-full left-0 mt-1 z-50">
                      <WorkspaceTimePickerDropdown
                        selectedTime={tempTimeCleared ? '' : (endTime ? formatTime(endTime) : '')}
                        searchQuery={inputTimeValue}
                        onTimeSelected={(time: string) => {
                          if (!time) {
                            setTempTimeCleared(true);
                            setShowEndTimePicker(false);
                            setInputTimeValue('');
                            return;
                          }
                          
                          setTempTimeCleared(false);
                          const [timePart] = time.split(' ');
                          const [hours, minutes] = timePart.split(':').map(Number);
                          const baseDate = endTime || new Date();
                          
                          // Handle AM/PM
                          let hour24 = hours;
                          if (time.includes('PM') && hours !== 12) {
                            hour24 += 12;
                          } else if (time.includes('AM') && hours === 12) {
                            hour24 = 0;
                          }
                          
                          baseDate.setHours(hour24, minutes, 0, 0);
                          setEndTime(new Date(baseDate));
                          setShowEndTimePicker(false);
                          setInputTimeValue('');
                        }}
                        isOpen={showEndTimePicker}
                        onClose={() => {
                          setShowEndTimePicker(false);
                          setInputTimeValue('');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.substring(0, 500))}
              placeholder="Enter task description..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {description.length}/500
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceEditTaskModal;
