import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ChevronDown, X as CloseIcon } from 'lucide-react';
import { AppDispatch, RootState } from '../../store';
import { createTask, getTasksByWorkspace } from '../../store/slices/workspace_task.slice';
import { CreateTaskRequest } from '../../types/workspace-task/workspace-task.types';
import { WorkspaceDetailDto, UserDetailDto } from '../../types/workspace/response/workspace.response';
import workspaceService from '../../services/workspace.service';
import { WorkspaceCalendarDatePicker } from './WorkspaceCalendarDatePicker.component';
import { WorkspaceTimePickerDropdown } from './WorkspaceTimePickerDropdown.component';

interface WorkspaceCreateTaskModalProps {
  workspaceId: string;
  onClose: () => void;
}

const WorkspaceCreateTaskModal: React.FC<WorkspaceCreateTaskModalProps> = ({ workspaceId, onClose }) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [assignedToList, setAssignedToList] = useState<string[]>([]);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<UserDetailDto[]>([]);
  const [showDeadlineFields, setShowDeadlineFields] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const workspaceDetail = await workspaceService.getWorkspaceById(workspaceId);
        console.log('Workspace detail:', workspaceDetail);
        const activeMembersArray = workspaceDetail?.members?.active || [];
        console.log('Active members:', activeMembersArray);
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

  // Parse time string to update date
  const parseTimeString = (timeString: string) => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;

    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }

    return { hours: hour24, minutes };
  };

  // Check if date/time is in the past
  const isDateTimePast = (date: Date): boolean => {
    const now = new Date();
    return date < now;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(t('task_title_required') || 'Task title is required');
      return;
    }

    // Check if deadline is in the past
    if (endTime && isDateTimePast(endTime)) {
      setError('Deadline cannot be in the past. Please select a future date and time.');
      return;
    }

    setLoading(true);
    try {
      // Clean up values - don't send empty strings
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();

      const taskData: CreateTaskRequest = {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        assigned_to_list: assignedToList.length > 0 ? assignedToList : undefined,
        end_time: endTime ? endTime.toISOString() : undefined,
      };

      console.log('[Modal] Creating task with data:', taskData);
      
      // Create the task
      const createdTask = await dispatch(createTask({ workspaceId, data: taskData })).unwrap();
      console.log('[Modal] Task created successfully:', createdTask);
      
      // Try to refetch tasks, but don't fail if it doesn't work
      try {
        console.log('[Modal] Refetching tasks...');
        await dispatch(getTasksByWorkspace(workspaceId)).unwrap();
        console.log('[Modal] Tasks refetched successfully');
      } catch (refetchErr) {
        console.warn('[Modal] Failed to refetch tasks, but task was created successfully:', refetchErr);
        // Don't set error, task was already created
      }
      
      // Reset form and close modal
      console.log('[Modal] Resetting form and closing modal');
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setEndTime(null);
      setShowDeadlineFields(false);
      setError(null);
      onClose();
    } catch (err: any) {
      console.error('[Modal] Failed to create task - Error:', err);
      console.error('[Modal] Error response:', err?.response?.data);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create task. Please try again.';
      setError(errorMessage);
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
            <div className="relative">
              {/* Dropdown Button */}
              <button
                type="button"
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white flex items-center justify-between hover:border-gray-300 transition-all"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                  {assignedToList.length > 0 ? (
                    <>
                      {assignedToList.slice(0, 2).map((memberId) => {
                        const member = members.find(m => m.user_id === memberId);
                        return (
                          <div key={memberId} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden">
                              {member?.avatar_url ? (
                                <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <span>{member?.full_name?.[0]?.toUpperCase() || '?'}</span>
                              )}
                            </div>
                            <span className="text-xs font-medium text-blue-700 truncate">{member?.full_name}</span>
                          </div>
                        );
                      })}
                      {assignedToList.length > 2 && (
                        <span className="text-xs font-medium text-blue-700 px-2.5 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                          +{assignedToList.length - 2} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No one assigned</span>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${showAssigneeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showAssigneeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  {/* Members list */}
                  <div className="max-h-72 overflow-y-auto">
                    {members && members.length > 0 ? (
                      members.map((member) => {
                        const isSelected = assignedToList.includes(member.user_id);
                        return (
                          <label
                            key={member.user_id}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 cursor-pointer transition-all duration-150 ${
                              isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                            }`}
                          >
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setAssignedToList(prev =>
                                  prev.includes(member.user_id)
                                    ? prev.filter(id => id !== member.user_id)
                                    : [...prev, member.user_id]
                                );
                              }}
                              aria-label={`Assign to ${member.full_name}`}
                              className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-blue-600"
                            />

                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden">
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
                          </label>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No members available
                      </div>
                    )}
                  </div>

                  {/* Selected Members Display */}
                  {assignedToList.length > 0 && (
                    <div className="border-t-2 border-gray-100 px-4 py-3 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700 mb-2.5 uppercase tracking-wide">Selected ({assignedToList.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {assignedToList.map(memberId => {
                          const member = members.find(m => m.user_id === memberId);
                          return (
                            <div key={memberId} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-100 rounded-full text-xs border border-blue-300">
                              <div className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                                {member?.full_name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span className="text-blue-700 font-medium">{member?.full_name}</span>
                              <button
                                type="button"
                                onClick={() => setAssignedToList(prev => prev.filter(id => id !== memberId))}
                                aria-label={`Remove ${member?.full_name}`}
                                className="ml-0.5 text-blue-400 hover:text-blue-600 font-bold hover:bg-blue-200 rounded-full px-1"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
              onClick={() => setShowDeadlineFields(!showDeadlineFields)}
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
                    ref={dateButtonRef}
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
                    <WorkspaceCalendarDatePicker
                      triggerRef={dateButtonRef}
                      selectedDate={endTime || new Date()}
                      onDateSelected={(date) => {
                        const currentTime = endTime || new Date();
                        date.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
                        const newDateTime = new Date(date);
                        
                        // Show error if date is in the past
                        if (isDateTimePast(newDateTime)) {
                          setError('Deadline cannot be in the past. Please select a future date and time.');
                          setShowEndDatePicker(false);
                          return;
                        }
                        
                        setEndTime(newDateTime);
                        setShowEndDatePicker(false);
                        setError(null);
                      }}
                      isOpen={showEndDatePicker}
                      onClose={() => setShowEndDatePicker(false)}
                    />
                  )}
                </div>

                {/* End Time */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                    className="flex items-center gap-2 w-full p-2 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    aria-label="Select deadline time"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">
                      {endTime ? formatTime(endTime) : 'Select time'}
                    </span>
                  </button>
                  {showEndTimePicker && (
                    <div className="absolute top-full left-0 mt-1 z-50">
                      <WorkspaceTimePickerDropdown
                        selectedTime={endTime ? formatTime(endTime) : ''}
                        onTimeSelected={(time: string) => {
                          const { hours, minutes } = parseTimeString(time);
                          const baseDate = endTime || new Date();
                          baseDate.setHours(hours, minutes, 0, 0);
                          const newDateTime = new Date(baseDate);
                          
                          // Show error if time is in the past
                          if (isDateTimePast(newDateTime)) {
                            setError('Deadline cannot be in the past. Please select a future date and time.');
                            setShowEndTimePicker(false);
                            return;
                          }

                          // If selected date is today, check that time is greater than current time
                          const today = new Date();
                          const selectedDateOnly = new Date(newDateTime);
                          selectedDateOnly.setHours(0, 0, 0, 0);
                          const todayOnly = new Date(today);
                          todayOnly.setHours(0, 0, 0, 0);

                          if (selectedDateOnly.getTime() === todayOnly.getTime()) {
                            // Same day - time must be greater than current time
                            if (newDateTime <= today) {
                              setError('Time must be greater than current time for today.');
                              setShowEndTimePicker(false);
                              return;
                            }
                          }
                          
                          setEndTime(newDateTime);
                          setShowEndTimePicker(false);
                          setError(null);
                        }}
                        isOpen={showEndTimePicker}
                        onClose={() => setShowEndTimePicker(false)}
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

          {/* Buttons - Bottom Section */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceCreateTaskModal;
