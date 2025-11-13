import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { AppDispatch, RootState } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import {
  deleteTask,
  updateTaskStatus,
  getTasksByWorkspace,
} from '../../store/slices/workspace_task.slice';
import WorkspaceEditTaskModal from './WorkspaceEditTaskModal.component';
import WorkspaceConfirmModal from './WorkspaceConfirmModal.component';
import { GROUP_CLASSNAMES } from '../../styles';
import { formatConsistentDateTime } from '../../utils/date.utils';
import './workspace-task.component.css';

interface WorkspaceTaskDetailModalProps {
  task: WorkspaceTask;
  workspaceId: string;
  workspaceMembers?: Array<{ _id: string; full_name: string; email: string; avatar_url?: string }>;
  currentUserId?: string;
  currentUserRole?: 'admin' | 'user';
  onClose: () => void;
}

const WorkspaceTaskDetailModal: React.FC<WorkspaceTaskDetailModalProps> = ({
  task: initialTask,
  workspaceId,
  workspaceMembers = [],
  currentUserId,
  currentUserRole = 'user',
  onClose,
}) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();

  // Get fresh task data from Redux after updates
  const allTasks = useSelector((state: RootState) => state.workspaceTask.tasks);
  const task = allTasks.find((t) => t._id === initialTask._id) || initialTask;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Permission helpers
  const canEditTask = (): boolean => {
    if (!currentUserId) return false;
    // Owner can edit any task
    if (currentUserRole === 'admin') return true;
    // Member can edit only if assigned
    const isAssigned =
      (task.assigned_to === currentUserId) ||
      (task.assigned_to_list?.includes(currentUserId) ?? false);
    return isAssigned;
  };

  const canDeleteTask = (): boolean => {
    if (!currentUserId) return false;
    // Owner can delete any task
    if (currentUserRole === 'admin') return true;
    // Member can delete if assigned or created by them
    const isAssigned =
      (task.assigned_to === currentUserId) ||
      (task.assigned_to_list?.includes(currentUserId) ?? false);
    const isCreator = task.created_by === currentUserId;
    return isAssigned || isCreator;
  };

  // Helper function to get status label
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'to-do': 'To Do',
      'in-progress': 'In Progress',
      done: 'Done',
    };
    return labels[status] || status;
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

  // Get assigned members info
  const assignedMembers = task.assigned_to_list?.map(memberId =>
    workspaceMembers.find(m => m._id === memberId)
  ).filter(Boolean) || [];

  // Get single assigned member (for backward compatibility)
  const assignedMember = task.assigned_to
    ? workspaceMembers.find(m => m._id === task.assigned_to)
    : null;

  return (
    <>
      <Modal
        isOpen={true}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
      >
        <div className={GROUP_CLASSNAMES.taskModalContent}>
          {/* Task title */}
          <div className={GROUP_CLASSNAMES.taskDetailHeader}>
            <h2 className="text-xl font-medium text-gray-900">
              {task.title}
            </h2>
          </div>

          {/* Description */}
          {task.description && (
            <div className={GROUP_CLASSNAMES.taskDetailDescription}>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          <div className={GROUP_CLASSNAMES.taskDetailSection}>
            <div className="space-y-2">
              {/* Status */}
              <div className="flex items-center py-2">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-gray-700">{t('status_label', 'Status')}:</div>
                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                  task.status === 'done' ? 'bg-green-100 text-green-700' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>

              {/* End Time */}
              {task.end_time && (
                <div className="flex items-center py-2">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-700">{t('due_label', 'Due')}:</div>
                  <span className="ml-auto text-sm text-gray-600">
                    {formatConsistentDateTime(task.end_time)}
                  </span>
                </div>
              )}

              {/* Assigned Members */}
              <div className="flex items-center py-2">
                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3a6 6 0 016-6h6a6 6 0 016 6z" />
                </svg>
                <div className="text-sm text-gray-700 flex-shrink-0">{t('assigned_label', 'Assigned To')}:</div>
                <div className="ml-auto flex-1 text-right">
                  {assignedMembers.length > 0 ? (
                    <div className="flex items-center justify-end gap-1">
                      {assignedMembers.map((member, index) => (
                        <div
                          key={member?._id}
                          className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 border-2 border-white shadow-sm hover:shadow-md transition-all ${index > 0 ? '-ml-3' : ''}`}
                          title={member?.full_name || 'Unknown'}
                        >
                          {member?.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member?.full_name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            member?.full_name?.[0]?.toUpperCase() || '?'
                          )}
                        </div>
                      ))}
                    </div>
                  ) : assignedMember ? (
                    <div className="flex items-center justify-end gap-1">
                      <div
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 border-2 border-white shadow-sm"
                        title={assignedMember?.full_name || 'Unknown'}
                      >
                        {assignedMember?.avatar_url ? (
                          <img
                            src={assignedMember.avatar_url}
                            alt={assignedMember?.full_name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          assignedMember?.full_name?.[0]?.toUpperCase() || '?'
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 italic">{t('unassigned_label', 'Unassigned')}</span>
                  )}
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center py-2">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m7-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-gray-700">{t('created_label', 'Created')}:</div>
                <span className="ml-auto text-sm text-gray-600">
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom buttons */}
          <div className={GROUP_CLASSNAMES.taskDetailFooter}>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {t('close', 'Close')}
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                disabled={loading || !canEditTask()}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={!canEditTask() ? 'Only Owner or assigned member can edit' : 'Edit task'}
              >
                {t('edit_button', 'Edit')}
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={loading || !canDeleteTask()}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-red-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={!canDeleteTask() ? 'Only Owner, creator, or assigned member can delete' : 'Delete task'}
              >
                {t('delete_button', 'Delete')}
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={GROUP_CLASSNAMES.taskModalCloseButton}
            aria-label={t('close_aria', 'Close modal')}
            title={t('close_title', 'Close')}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Modal>

      {/* Modals rendered outside with Portal to avoid z-index stacking context issues */}
      {isEditModalOpen && createPortal(
        <WorkspaceEditTaskModal
          task={task}
          workspaceId={workspaceId}
          onClose={() => {
            setIsEditModalOpen(false);
            onClose(); // Close the detail modal as well
          }}
        />,
        document.body
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && createPortal(
        <WorkspaceConfirmModal
          isOpen={showDeleteConfirm}
          title={t('delete_confirm_title', 'Delete Task')}
          message={t('delete_confirm_message', 'Are you sure you want to delete this task? This action cannot be undone.')}
          confirmText={t('delete_confirm_button', 'Delete')}
          cancelText={t('cancel_button', 'Cancel')}
          isDangerous={true}
          onConfirm={confirmDeleteTask}
          onCancel={() => {
            setShowDeleteConfirm(false);
          }}
        />,
        document.body
      )}
    </>
  );
};

export default WorkspaceTaskDetailModal;
