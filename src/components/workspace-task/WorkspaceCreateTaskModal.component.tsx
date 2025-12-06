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
import WorkspaceTaskLimitExceededModal from './WorkspaceTaskLimitExceededModal.component';
import WorkspaceTaskLimitMemberModal from './WorkspaceTaskLimitMemberModal.component';

interface WorkspaceCreateTaskModalProps {
  workspaceId: string;
  onClose: () => void;
}

const WorkspaceCreateTaskModal: React.FC<WorkspaceCreateTaskModalProps> = ({ workspaceId, onClose }) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [assignedToList, setAssignedToList] = useState<string[]>([]);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [members, setMembers] = useState<UserDetailDto[]>([]);
  const [showDeadlineFields, setShowDeadlineFields] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [tempTimeCleared, setTempTimeCleared] = useState(false);
  const [inputTimeValue, setInputTimeValue] = useState('');
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  
  // State for upgrade modals
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{
    workspaceName?: string;
    ownerName?: string;
    ownerEmail?: string;
    isOwner?: boolean;
    errorDetails?: any;
    upgradeInfo?: any;
  }>({});

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

  // Close assignee dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false);
      }
    };

    if (showAssigneeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAssigneeDropdown]);

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
      console.error('[Modal] Failed to create task - Full Error:', err);
      console.error('[Modal] Error message:', err?.message);
      
      // Redux thunk rejectWithValue returns error in err directly (not in err.response.data)
      const errorData = err || {};
      const errorMessage = errorData?.message || 'Failed to create task. Please try again.';
      const errorCode = errorData?.error;
      
      // Check if error code indicates workspace task limit
      const isLimitError = errorCode === 'WORKSPACE_TASK_LIMIT_EXCEEDED';
      
      console.log('[Modal] 🔍 Parsed error data:', {
        errorData: JSON.stringify(errorData, null, 2),
        errorMessage,
        errorCode,
        isLimitError
      });
      
      if (isLimitError) {
        // Show upgrade modal instead of error message
        console.log('[Modal] ✅ Workspace task limit exceeded, showing upgrade modal');
        console.log('[Modal] 📦 Error details:', errorData?.details);
        console.log('[Modal] 🎯 Upgrade info:', errorData?.upgrade);
        
        // Clear any previous error messages
        setError(null);
        
        // Get workspace info and check if current user is owner
        let workspaceName = '';
        let ownerName = '';
        let ownerEmail = '';
        let isOwner = false;
        
        try {
          const workspaceDetail = await workspaceService.getWorkspaceById(workspaceId);
          workspaceName = workspaceDetail?.name || '';
          const ownerId = workspaceDetail?.owner_id;
          
          // Check if current user is the owner
          isOwner = currentUser?._id === ownerId;
          
          // Get owner info from members
          if (ownerId && workspaceDetail?.members?.active) {
            const ownerMember = workspaceDetail.members.active.find(m => m.user_id === ownerId);
            if (ownerMember) {
              ownerName = ownerMember.full_name || ownerMember.email || '';
              ownerEmail = ownerMember.email || '';
            }
          }
        } catch (wsErr) {
          console.warn('[Modal] Failed to fetch workspace details:', wsErr);
        }
        
        const modalData = {
          workspaceName,
          ownerName,
          ownerEmail,
          isOwner,
          errorDetails: errorData?.details || {
            membershipLevel: 'BASIC',
            currentLimit: 20,
            tasksCreatedToday: 20,
          },
          upgradeInfo: errorData?.upgrade || {
            suggestion: 'Upgrade to PLUS to increase your daily workspace task limit from 20 to 50 tasks.',
            currentLevel: 'BASIC',
            suggestedLevel: 'PLUS',
            suggestedLimit: 50,
            limitIncrease: 30,
          },
        };
        
        console.log('[Modal] 📤 Setting modal data:', JSON.stringify(modalData, null, 2));
        console.log('[Modal] 🔑 Is owner:', isOwner);
        setUpgradeModalData(modalData);
        console.log('[Modal] 🚀 Opening upgrade modal - showUpgradeModal will be true');
        
        // Show appropriate modal based on whether user is owner
        if (isOwner) {
          setShowUpgradeModal(true);
        } else {
          setShowMemberModal(true);
        }
        
        console.log('[Modal] ✅ Modal state updated');
      } else {
        // Show regular error message for other errors
        console.log('[Modal] ⚠️ Regular error, showing error message');
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Debug log for render
  console.log('[Modal Render] showUpgradeModal:', showUpgradeModal);
  console.log('[Modal Render] showMemberModal:', showMemberModal);
  console.log('[Modal Render] upgradeModalData:', upgradeModalData);
  console.log('[Modal Render] currentUser:', currentUser);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
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
          {/* Error Message - Only show if not showing upgrade modal */}
          {error && !showUpgradeModal && (
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
                            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 cursor-pointer transition-all duration-150 ${
                              isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                            }`}
                          >
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

                            {/* Selected indicator */}
                            {isSelected && (
                              <svg className="w-5 h-5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
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
                        setTempTimeCleared(false); // Reset flag when date is selected
                        setShowEndDatePicker(false);
                        setError(null);
                        setTimeError(null);
                      }}
                      isOpen={showEndDatePicker}
                      onClose={() => setShowEndDatePicker(false)}
                    />
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
                      setTimeError(null); // Clear error when typing
                      
                      // Allow clearing
                      if (!value) {
                        setTempTimeCleared(true);
                        setShowEndTimePicker(false);
                        setTimeError(null);
                        return;
                      }
                      
                      // Validate and update if valid format
                      if (validateTimeInput(value)) {
                        setTempTimeCleared(false);
                        const { hours, minutes } = parseTimeString(value);
                        const baseDate = endTime || new Date();
                        baseDate.setHours(hours, minutes, 0, 0);
                        const newDateTime = new Date(baseDate);
                        
                        // Check if datetime is in the past
                        if (isDateTimePast(newDateTime)) {
                          setTimeError('Deadline cannot be in the past. Please select a future date and time.');
                          setError('Deadline cannot be in the past. Please select a future date and time.');
                          return;
                        }
                        
                        setEndTime(newDateTime);
                        setTimeError(null);
                        setError(null);
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
                        setTimeError(null); // Clear error when blur
                      }, 200);
                    }}
                    placeholder="HH:mm"
                    className={`w-full px-3 py-2 pr-9 text-sm border rounded-md font-mono placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      timeError
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    maxLength={5}
                    aria-label="Enter deadline time"
                  />
                  {/* Clock Icon */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  {/* Time Error Message */}
                  {timeError && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {timeError}
                    </p>
                  )}
                  
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
                          const newDateTime = new Date(baseDate);
                          
                          if (isDateTimePast(newDateTime)) {
                            setTimeError('Deadline cannot be in the past. Please select a future date and time.');
                            setError('Deadline cannot be in the past. Please select a future date and time.');
                            setShowEndTimePicker(false);
                            return;
                          }
                          
                          setEndTime(newDateTime);
                          setShowEndTimePicker(false);
                          setInputTimeValue('');
                          setTimeError(null);
                          setError(null);
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

          {/* Buttons - Bottom Section */}
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
                  Creating...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Workspace Task Limit Exceeded - Owner Modal */}
      {showUpgradeModal && (
        <>
          {console.log('[Modal Render] 🎭 Rendering WorkspaceTaskLimitExceededModal (Owner) with data:', {
            workspaceName: upgradeModalData.workspaceName,
            ownerName: upgradeModalData.ownerName,
            errorDetails: upgradeModalData.errorDetails,
            upgradeInfo: upgradeModalData.upgradeInfo,
          })}
          <WorkspaceTaskLimitExceededModal
            isOpen={showUpgradeModal}
            onClose={() => {
              console.log('[Modal] Closing upgrade modal and create modal');
              setShowUpgradeModal(false);
              setUpgradeModalData({});
              onClose(); // Close the create modal as well
            }}
            workspaceName={upgradeModalData.workspaceName}
            ownerName={upgradeModalData.ownerName}
            errorDetails={upgradeModalData.errorDetails}
            upgradeInfo={upgradeModalData.upgradeInfo}
          />
        </>
      )}
      
      {/* Workspace Task Limit Exceeded - Member Modal */}
      {showMemberModal && (
        <>
          {console.log('[Modal Render] 🎭 Rendering WorkspaceTaskLimitMemberModal (Member) with data:', {
            workspaceName: upgradeModalData.workspaceName,
            ownerName: upgradeModalData.ownerName,
            ownerEmail: upgradeModalData.ownerEmail,
            errorDetails: upgradeModalData.errorDetails,
            upgradeInfo: upgradeModalData.upgradeInfo,
          })}
          <WorkspaceTaskLimitMemberModal
            isOpen={showMemberModal}
            onClose={() => {
              console.log('[Modal] Closing member modal and create modal');
              setShowMemberModal(false);
              setUpgradeModalData({});
              onClose(); // Close the create modal as well
            }}
            workspaceName={upgradeModalData.workspaceName}
            ownerName={upgradeModalData.ownerName}
            ownerEmail={upgradeModalData.ownerEmail}
            errorDetails={upgradeModalData.errorDetails}
            upgradeInfo={upgradeModalData.upgradeInfo}
          />
        </>
      )}
    </div>
  );
};

export default WorkspaceCreateTaskModal;
