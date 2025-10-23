import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { assignTask, getTasksByWorkspace } from '../../store/slices/workspace_task.slice';

interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AssignMemberModalProps {
  task: WorkspaceTask;
  workspaceId: string;
  members: Member[];
  onClose: () => void;
}

const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
  task,
  workspaceId,
  members,
  onClose,
}) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    task.assigned_to?._id || '',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!selectedMemberId) {
      setError(t('please_select_member') || 'Please select a member');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await dispatch(
        assignTask({
          workspaceId,
          taskId: task._id,
          userId: selectedMemberId,
        }),
      ).unwrap();
      // Refetch tasks after assign
      await dispatch(getTasksByWorkspace(workspaceId)).unwrap();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign task';
      setError(errorMessage);
      console.error('Error assigning task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    setError(null);
    setLoading(true);
    try {
      setSelectedMemberId('');
      await dispatch(
        assignTask({
          workspaceId,
          taskId: task._id,
          userId: '',
        }),
      ).unwrap();
      // Refetch tasks after unassign
      await dispatch(getTasksByWorkspace(workspaceId)).unwrap();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unassign task';
      setError(errorMessage);
      console.error('Error unassigning task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] my-auto">
        {/* Header */}
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
          <h2 className="text-xl font-bold text-gray-900 pr-8">Assign Member</h2>
          <p className="text-sm text-gray-500 mt-1">Choose who will work on this task</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <span className="text-red-600 font-medium text-sm">⚠️</span>
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {/* Members List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Team Member
            </label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {/* Unassigned Option */}
              <div
                onClick={() => !loading && setSelectedMemberId('')}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMemberId === ''
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Unassigned</span>
                  {selectedMemberId === '' && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Member Options */}
              {members.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No members available
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={member._id}
                    onClick={() => !loading && setSelectedMemberId(member._id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedMemberId === member._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {member.avatar && (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      </div>
                      {selectedMemberId === member._id && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleUnassign}
              disabled={loading || selectedMemberId === ''}
              className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Unassigning...
                </>
              ) : (
                <>
                  <span>🔓</span>
                  Unassign
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={loading || !selectedMemberId}
              className="flex-1 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Assign
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignMemberModal;
