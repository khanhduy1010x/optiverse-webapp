import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { deleteTask } from '../../store/slices/workspace_task.slice';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const ITEMS_PER_PAGE = 10;

interface WorkspaceTaskListProps {
  workspaceId: string;
  tasks: WorkspaceTask[];
  workspaceMembers?: Array<{ _id: string; name: string; email: string; avatar?: string }>;
}

const WorkspaceTaskList: React.FC<WorkspaceTaskListProps> = ({
  workspaceId,
  tasks,
  workspaceMembers = [],
}) => {
  const { t } = useAppTranslate('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WorkspaceTask | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleTaskClick = (task: WorkspaceTask) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleEditClick = (task: WorkspaceTask) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  // Reset page khi tasks thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [tasks]);

  // Calculate pagination values
  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, tasks.length);
  const paginatedTasks = useMemo(
    () => tasks.slice(startIndex, endIndex),
    [tasks, startIndex, endIndex]
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setLoading(true);
    try {
      await dispatch(deleteTask({ workspaceId, taskId: taskToDelete })).unwrap();
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
      if (selectedTask?._id === taskToDelete) {
        setShowDetailModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <svg
          className="w-12 h-12 text-gray-400 mb-4"
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
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {t('No tasks') || 'No tasks'}
        </h3>
        <p className="text-gray-500 text-sm text-center">
          {t('Get started by creating a new task') || 'Get started by creating a new task'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <ul className="divide-y divide-gray-100">
        {paginatedTasks.map(task => (
          <li
            key={task._id}
            className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group flex items-start"
            onClick={() => handleTaskClick(task)}
          >
            <div className="flex items-center flex-1">
              <input
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                title="Select task"
                aria-label={`Select ${task.title}`}
                onClick={e => e.stopPropagation()}
              />

              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    P3
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {task.description}
                  </p>
                )}
              </div>

              <span className="ml-4 text-sm text-gray-500 flex-shrink-0">
                {new Date(task.updatedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>

            <div className="ml-4 flex-shrink-0 invisible group-hover:visible flex gap-2">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleEditClick(task);
                }}
                className="text-gray-400 hover:text-gray-600"
                title="Edit task"
                aria-label="Edit task"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteClick(task._id);
                }}
                className="text-gray-400 hover:text-red-600"
                title="Delete task"
                aria-label="Delete task"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {tasks.length > ITEMS_PER_PAGE && (
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('workspace_task.delete_task') || 'Delete Task'}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {t('workspace_task.delete_task_confirm') || 'Are you sure you want to delete this task?'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTaskToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('workspace_task.cancel') || 'Cancel'}
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : t('workspace_task.delete') || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceTaskList;
