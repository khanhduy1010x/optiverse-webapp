import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { updateTaskStatus } from '../../store/slices/workspace_task.slice';

interface WorkspaceTaskListItemProps {
  task: WorkspaceTask;
  workspaceId: string;
  onEdit: (task: WorkspaceTask) => void;
  onDelete: (taskId: string) => void;
  onClick: (task: WorkspaceTask) => void;
}

/**
 * WorkspaceTaskListItem - Single task item in list view
 * Responsible only for rendering, all logic is in parent component
 */
export const WorkspaceTaskListItem: React.FC<WorkspaceTaskListItemProps> = ({
  task,
  workspaceId,
  onEdit,
  onDelete,
  onClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isClosed = task.status === 'done';

  // Handle checkbox click to toggle between 'to-do' and 'done'
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'done' ? 'to-do' : 'done';
    dispatch(updateTaskStatus({
      workspaceId,
      taskId: task._id,
      status: newStatus,
    }));
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (task.status) {
      case 'done':
        return <span className="text-green-500 text-lg">✓</span>;
      case 'in-progress':
        return <span className="text-blue-500 text-lg">●</span>;
      default:
        return <span className="text-gray-300 text-lg">○</span>;
    }
  };

  return (
    <li
      className="group flex items-center gap-4 py-3 px-4 hover:bg-gray-50/70 transition-all duration-200 border-b border-gray-100 last:border-b-0 cursor-pointer"
      onClick={() => onClick(task)}
    >
      {/* Checkbox - Apple Style */}
      <div
        onClick={handleCheckboxClick}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
          isClosed
            ? 'bg-green-500 border-green-500 text-white shadow-sm'
            : 'border-gray-300 hover:border-green-400 group-hover:border-green-400'
        }`}
        title="Toggle task completion"
      >
        {isClosed && (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      {/* Status Icon */}
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
        {getStatusIcon()}
      </div>

      {/* Task Title - Main Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-medium transition-colors duration-200 ${
          isClosed 
            ? 'text-gray-400 line-through' 
            : 'text-gray-900'
        }`}>
          {task.title}
        </h3>
      </div>

      {/* Assignee Avatar */}
      {task.assigned_to ? (
        <div 
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200"
          title={`Assigned to ${(task.assigned_to as any)?.name || 'Unknown'}`}
        >
          {(task.assigned_to as any)?.name?.[0]?.toUpperCase() || '?'}
        </div>
      ) : (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold">
          -
        </div>
      )}

      {/* Date */}
      <div className="flex-shrink-0 text-sm text-gray-500 min-w-max">
        {task.updatedAt ? (
          <span title={new Date(task.updatedAt).toLocaleDateString('vi-VN')}>
            {formatDistanceToNow(new Date(task.updatedAt), { locale: vi })}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </div>

      {/* Action Buttons - Apple Style */}
      <div className="ml-2 flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="Edit task"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94m-4.88-4.88L17.81 9.94m-4.88-4.88l4.88 4.88M7.07 5.19L4 8.25M19.08 2.92l2.83 2.83a1.414 1.414 0 010 2l-2.83-2.83"/>
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task._id);
          }}
          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          title="Delete task"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
          </svg>
        </button>
      </div>
    </li>
  );
};

export default WorkspaceTaskListItem;
