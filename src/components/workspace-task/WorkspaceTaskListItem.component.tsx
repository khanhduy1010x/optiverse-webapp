import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { format } from 'date-fns';
import { updateTaskStatus } from '../../store/slices/workspace_task.slice';

interface WorkspaceTaskListItemProps {
  task: WorkspaceTask;
  workspaceId: string;
  workspaceMembers?: Array<{ _id: string; full_name: string; email: string; avatar_url?: string }>;
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
  workspaceMembers = [],
  onEdit,
  onDelete,
  onClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isClosed = task.status === 'done';

  // Tìm user từ assigned_to ObjectId
  const assignedUser = task.assigned_to 
    ? workspaceMembers.find(m => m._id === task.assigned_to)
    : null;

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
      {assignedUser ? (
        <div 
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          title={`Assigned to ${assignedUser.full_name}`}
        >
          {assignedUser.avatar_url ? (
            <img 
              src={assignedUser.avatar_url} 
              alt={assignedUser.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{assignedUser.full_name?.[0]?.toUpperCase() || '?'}</span>
          )}
        </div>
      ) : (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold">
          -
        </div>
      )}

      {/* Date */}
      <div className="flex-shrink-0 text-sm text-gray-500 min-w-max">
        {task.updatedAt ? (
          <span title={new Date(task.updatedAt).toLocaleString('en-US')}>
            {format(new Date(task.updatedAt), 'MMM dd')}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </div>

      {/* Action Buttons - Apple Style */}
      <div className="ml-2 flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
          title="Edit task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task._id);
          }}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
          title="Delete task"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v1a1 1 0 001 1v8a3 3 0 003 3h4a3 3 0 003-3V7a1 1 0 001-1V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v8a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v8a1 1 0 102 0V8a1 1 0 00-1-1z" />
          </svg>
        </button>
      </div>
    </li>
  );
};

export default WorkspaceTaskListItem;
