import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { assignTask, getTasksByWorkspace } from '../../store/slices/workspace_task.slice';

interface Member {
  _id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface WorkspaceAssignMemberModalProps {
  task: WorkspaceTask;
  workspaceId: string;
  members: Member[];
  onClose: () => void;
}

const WorkspaceAssignMemberModal: React.FC<WorkspaceAssignMemberModalProps> = ({
  task,
  workspaceId,
  members,
  onClose,
}) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.workspaceTask.loading);
  
  // Initialize with multiple members from assigned_to_list or fallback to assigned_to
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    new Set(task.assigned_to_list && task.assigned_to_list.length > 0 
      ? task.assigned_to_list 
      : (task.assigned_to ? [task.assigned_to] : [])
    )
  );
  const [error, setError] = useState<string | null>(null);

  // Get currently assigned member names for display
  const getCurrentlyAssignedNames = (): string => {
    const assigned = task.assigned_to_list?.map(memberId =>
      members.find(m => m._id === memberId)?.full_name
    ).filter(Boolean) || [];
    
    if (assigned.length === 0 && task.assigned_to) {
      const member = members.find(m => m._id === task.assigned_to);
      return member?.full_name || task.assigned_to;
    }
    
    return assigned.length > 0 ? assigned.join(', ') : 'unassigned';
  };

  // Toggle member selection
  const handleToggleMember = (memberId: string) => {
    if (isLoading) return;
    
    const newSelected = new Set(selectedMemberIds);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMemberIds(newSelected);
    setError(null);
  };

  const handleAssign = async () => {
    setError(null);
    
    try {
      await dispatch(
        assignTask({
          workspaceId,
          taskId: task._id,
          userIds: Array.from(selectedMemberIds),
        })
      ).unwrap();
      await dispatch(getTasksByWorkspace(workspaceId)).unwrap();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to assign members');
      console.error('Error assigning members:', err);
    }
  };

  const handleUnassign = async () => {
    setError(null);
    
    try {
      await dispatch(
        assignTask({
          workspaceId,
          taskId: task._id,
          userIds: [],
        })
      ).unwrap();
      await dispatch(getTasksByWorkspace(workspaceId)).unwrap();
      setSelectedMemberIds(new Set());
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to unassign members');
      console.error('Error unassigning members:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px]">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900 pr-8">Assign Member</h2>
          <p className="text-sm text-gray-500 mt-1">
            Currently assigned to: {getCurrentlyAssignedNames()}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <span className="text-red-600 font-medium">⚠️</span>
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {/* Team Member Label */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Team Member
            </label>

            {/* Member Selection with Checkboxes */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {members.length === 0 ? (
                <div className="p-4 text-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">No members available</p>
                </div>
              ) : (
                members.map((member) => {
                  const isSelected = selectedMemberIds.has(member._id);
                  return (
                    <div
                      key={member._id}
                      onClick={() => handleToggleMember(member._id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Member Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {member.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{member.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{member.email}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={handleUnassign}
            disabled={isLoading || selectedMemberIds.size === 0}
            className="px-4 py-2 border border-orange-300 text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            🔓 unassign
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Assigning...
              </>
            ) : (
              <>
                ✓ assign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceAssignMemberModal;
