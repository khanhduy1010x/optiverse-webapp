import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store';
import { createTask, getTasksByWorkspace } from '../../store/slices/workspace_task.slice';
import { CreateTaskRequest } from '../../types/workspace-task/workspace-task.types';
import { WorkspaceDetailDto, UserDetailDto } from '../../types/workspace/response/workspace.response';
import workspaceService from '../../services/workspace.service';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<UserDetailDto[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(t('task_title_required') || 'Task title is required');
      return;
    }

    setLoading(true);
    try {
      // Clean up values - don't send empty strings
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();
      const trimmedAssignedTo = assignedTo?.trim();

      const taskData: CreateTaskRequest = {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        assigned_to: trimmedAssignedTo || undefined, // Only include if has value
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
        {/* Header - Simple Input */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.substring(0, 100))}
            placeholder="Add title"
            maxLength={100}
            className="w-full text-lg font-medium border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 py-2 px-0 text-gray-900 placeholder-gray-400"
            disabled={loading}
            autoFocus
            required
          />
          
          {/* Assignee Section */}
          <div className="mt-4 pt-4">
            <label htmlFor="assignee-select" className="block text-sm font-medium text-gray-700 mb-2">Assign to</label>
            <select
              id="assignee-select"
              value={assignedTo}
              onChange={(e) => {
                console.log('Selected assignee:', e.target.value);
                setAssignedTo(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              disabled={loading}
            >
              <option value="">No one assigned</option>
              {members && members.length > 0 ? (
                members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.full_name || member.email || 'Unknown'}
                  </option>
                ))
              ) : (
                <option disabled>No members available</option>
              )}
            </select>
            {members.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">Loading members...</p>
            )}
          </div>
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-400"></span>
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
