import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { deleteTask, updateTask, updateTaskStatus } from '../../store/slices/workspace_task.slice';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { WorkspaceTaskListItem } from './WorkspaceTaskListItem.component';
import WorkspaceConfirmModal from './WorkspaceConfirmModal.component';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';

interface WorkspaceTaskListViewProps {
  workspaceId: string;
  tasks: WorkspaceTask[];
  loading?: boolean;
  onTaskEdit?: (task: WorkspaceTask) => void;
  onTaskClick?: (task: WorkspaceTask) => void;
}

const WorkspaceTaskListView: React.FC<WorkspaceTaskListViewProps> = ({
  workspaceId,
  tasks,
  loading = false,
  onTaskEdit,
  onTaskClick,
}) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    return {
      'done': tasks.filter(task => task.status === 'done'),
      'in-progress': tasks.filter(task => task.status === 'in-progress'),
      'to-do': tasks.filter(task => task.status === 'to-do'),
    };
  }, [tasks]);

  // Status configuration
  const statusConfig = [
    {
      id: 'done',
      label: 'Done',
      icon: '✓',
      color: 'bg-green-50',
      badgeColor: 'bg-green-600',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      icon: '●',
      color: 'bg-blue-50',
      badgeColor: 'bg-blue-600',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
    },
    {
      id: 'to-do',
      label: 'To Do',
      icon: '○',
      color: 'bg-gray-50',
      badgeColor: 'bg-gray-600',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
    },
  ];

  // Handle task checkbox
  const handleTaskCheck = (taskId: string) => {
    // Implement if needed
  };

  // Handle status change
  const handleStatusChange = (taskId: string, newStatus: 'to-do' | 'in-progress' | 'done') => {
    dispatch(updateTaskStatus({
      workspaceId,
      taskId,
      status: newStatus,
    }));
  };

  // Handle delete
  const handleDelete = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (taskToDelete) {
      dispatch(deleteTask({ workspaceId, taskId: taskToDelete }));
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  // Handle task click
  const handleTaskRowClick = (task: WorkspaceTask) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  // Handle task edit
  const handleTaskEdit = (task: WorkspaceTask) => {
    if (onTaskEdit) {
      onTaskEdit(task);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={GROUP_CLASSNAMES.flexCenterCenter + ' py-12'}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className={GROUP_CLASSNAMES.taskEmptyState}>
        <svg
          className={GROUP_CLASSNAMES.taskEmptyIcon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <h3 className={GROUP_CLASSNAMES.taskEmptyTitle}>
          {t('no_tasks')}
        </h3>
        <p className={GROUP_CLASSNAMES.taskEmptyDescription}>
          {t('no_tasks')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Status Sections */}
      {statusConfig.map((status) => {
        const statusTasks = tasksByStatus[status.id as keyof typeof tasksByStatus];
        
        return (
          <div key={status.id} className="space-y-2">
            {/* Status Header - Apple Style */}
            <div className="flex items-center gap-2 px-2 py-1">
              <span className={`text-lg font-semibold ${status.textColor}`}>
                {status.icon}
              </span>
              <h2 className={`text-sm font-semibold ${status.textColor} tracking-tight`}>
                {status.label}
              </h2>
              <span className={`ml-auto ${status.badgeColor} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
                {statusTasks.length}
              </span>
            </div>

            {/* Tasks List - Apple Style Container */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
              {statusTasks.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm font-medium">
                  No tasks
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {statusTasks.map((task) => (
                    <WorkspaceTaskListItem
                      key={task._id}
                      task={task}
                      workspaceId={workspaceId}
                      onEdit={handleTaskEdit}
                      onDelete={handleDelete}
                      onClick={handleTaskRowClick}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}

      {/* Delete Confirmation Modal */}
      <WorkspaceConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
};

export default WorkspaceTaskListView;
