import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import {
  deleteSubtask,
  updateSubtaskStatus,
  deleteTask,
  updateTaskStatus,
  getTasksByWorkspace,
} from '../../store/slices/workspace_task.slice';
import { EditTaskModal, AssignMemberModal, CreateSubtaskModal, ConfirmModal } from './index';

interface TaskDetailModalProps {
  task: WorkspaceTask;
  workspaceId: string;
  workspaceMembers?: Array<{ _id: string; name: string; email: string; avatar?: string }>;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task: initialTask,
  workspaceId,
  workspaceMembers = [],
  onClose,
}) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  
  // Get fresh task data from Redux after updates
  const allTasks = useSelector((state: RootState) => state.workspaceTask.tasks);
  const task = allTasks.find(t => t._id === initialTask._id) || initialTask;
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateSubtaskModalOpen, setIsCreateSubtaskModalOpen] = useState(false);
  const [confirmDeleteSubtaskId, setConfirmDeleteSubtaskId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper function to get status label
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'to-do': 'To Do',
      'in-progress': 'In Progress',
      'done': 'Done',
    };
    return labels[status] || status;
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setConfirmDeleteSubtaskId(subtaskId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSubtask = async () => {
    if (confirmDeleteSubtaskId) {
      setLoading(true);
      setError(null);
      try {
        await dispatch(deleteSubtask({ workspaceId, taskId: task._id, subtaskId: confirmDeleteSubtaskId })).unwrap();
        // Refetch tasks after delete
        await dispatch(getTasksByWorkspace(workspaceId)).unwrap();
        setConfirmDeleteSubtaskId(null);
        setShowDeleteConfirm(false);
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to delete subtask';
        setError(errorMsg);
        console.error('Error deleting subtask:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteTask = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(deleteTask({ workspaceId, taskId: task._id })).unwrap();
      // Refetch tasks after delete
      await dispatch(getTasksByWorkspace(workspaceId)).unwrap();
      onClose();
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to delete task';
      setError(errorMsg);
      console.error('Error deleting task:', err);
      setLoading(false);
    }
  };

  const handleMoveStatus = async () => {
    const nextStatus =
      task.status === 'to-do' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'to-do';
    setLoading(true);
    setError(null);
    try {
      await dispatch(
        updateTaskStatus({
          workspaceId,
          taskId: task._id,
          status: nextStatus,
        }),
      ).unwrap();
      // Refetch tasks after status update
      await dispatch(getTasksByWorkspace(workspaceId)).unwrap();
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to update task status';
      setError(errorMsg);
      console.error('Error updating task status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubtaskStatus = async (subtaskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'to-do' ? 'in-progress' : 'done';
    setLoading(true);
    setError(null);
    try {
      await dispatch(
        updateSubtaskStatus({
          workspaceId,
          taskId: task._id,
          subtaskId,
          status: nextStatus,
        }),
      ).unwrap();
      // Refetch tasks after subtask status update
      await dispatch(getTasksByWorkspace(workspaceId)).unwrap();
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to update subtask status';
      setError(errorMsg);
      console.error('Error updating subtask status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[700px] my-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-900 pr-8 mb-2">{task.title}</h2>
          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <span className="text-red-600 font-medium text-sm">⚠️</span>
              <span className="text-red-600 text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          )}
          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Status Card */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-2">Status</div>
              <div className={`inline-block px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(task.status)}`}>
                {getStatusLabel(task.status)}
              </div>
            </div>

            {/* Created Date Card */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-2">Created</div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(task.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* Assigned To Card */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-2">Assigned To</div>
              {task.assigned_to ? (
                <div className="flex items-center gap-2">
                  {task.assigned_to.avatar && (
                    <img
                      src={task.assigned_to.avatar}
                      alt={task.assigned_to.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-900">{task.assigned_to.name}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500 italic">Unassigned</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setIsEditModalOpen(true)}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
            >
              <span>✏️</span>
              Edit
            </button>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
            >
              <span>👤</span>
              Assign
            </button>
            <button
              onClick={handleMoveStatus}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
            >
              <span>{loading ? '⏳' : '➡️'}</span>
              {loading ? 'Moving...' : `Move to ${getStatusLabel(task.status === 'to-do' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'to-do')}`}
            </button>
            <button
              onClick={handleDeleteTask}
              disabled={loading}
              className="px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm ml-auto"
            >
              <span>🗑️</span>
              Delete
            </button>
          </div>

          {/* Subtasks Section */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Subtasks</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {task.subtask_completed_count} of {task.subtasks.length} completed
                </p>
              </div>
              <button
                onClick={() => setIsCreateSubtaskModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <span>➕</span>
                Add Subtask
              </button>
            </div>

            {/* Progress Bar */}
            {task.subtasks.length > 0 && (
              <div className="mb-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{
                    width: `${(task.subtask_completed_count / task.subtasks.length) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Subtasks List */}
            {task.subtasks.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-sm">No subtasks yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask._id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={subtask.status === 'done'}
                      onChange={() =>
                        handleToggleSubtaskStatus(subtask._id, subtask.status)
                      }
                      className="mt-1 w-5 h-5 accent-blue-500 rounded cursor-pointer"
                      title={`Toggle subtask: ${subtask.title}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-sm ${
                          subtask.status === 'done'
                            ? 'line-through text-gray-400'
                            : 'text-gray-900'
                        }`}
                      >
                        {subtask.title}
                      </div>
                      {subtask.description && (
                        <p className="text-xs text-gray-600 mt-1">{subtask.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-gray-600">
                          👤 {subtask.assigned_to?.name || 'Unassigned'}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full font-medium border ${getStatusColor(
                            subtask.status
                          )}`}
                        >
                          {getStatusLabel(subtask.status)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSubtask(subtask._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600 flex-shrink-0"
                      title="Delete subtask"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EditTaskModal
          task={task}
          workspaceId={workspaceId}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
      {isAssignModalOpen && (
        <AssignMemberModal
          task={task}
          workspaceId={workspaceId}
          members={workspaceMembers}
          onClose={() => setIsAssignModalOpen(false)}
        />
      )}
      {isCreateSubtaskModalOpen && (
        <CreateSubtaskModal
          task={task}
          workspaceId={workspaceId}
          onClose={() => setIsCreateSubtaskModalOpen(false)}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          title={confirmDeleteSubtaskId ? 'Xóa Công Việc Con' : 'Xóa Công Việc'}
          message={confirmDeleteSubtaskId ? 'Bạn chắc chắn muốn xóa công việc con này?' : 'Bạn chắc chắn muốn xóa công việc này?'}
          confirmText="Xóa"
          cancelText="Hủy"
          isDangerous={true}
          onConfirm={confirmDeleteSubtaskId ? confirmDeleteSubtask : confirmDeleteTask}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setConfirmDeleteSubtaskId(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskDetailModal;
