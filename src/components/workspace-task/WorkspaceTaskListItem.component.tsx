import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { format } from 'date-fns';
import { updateTaskStatus } from '../../store/slices/workspace_task.slice';
import { useWorkspaceTaskCountdown } from '../../hooks/workspace-task/useWorkspaceTaskCountdown';

interface WorkspaceTaskListItemProps {
  task: WorkspaceTask;
  workspaceId: string;
  workspaceMembers?: Array<{ _id: string; full_name: string; email: string; avatar_url?: string }>;
  currentUserId?: string;
  currentUserRole?: 'admin' | 'user';
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
  currentUserId,
  currentUserRole = 'user',
  onEdit,
  onDelete,
  onClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isClosed = task.status === 'done';
  
  // Use countdown hook for deadline management
  const { countdownText, isOverdue, formattedDeadline } = useWorkspaceTaskCountdown(task, workspaceId);

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

  // Tìm user từ assigned_to ObjectId
  const assignedUser = task.assigned_to 
    ? workspaceMembers.find(m => m._id === task.assigned_to)
    : null;

  // Handle checkbox click to cycle through status: to-do → in-progress → done → to-do
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    let newStatus: 'to-do' | 'in-progress' | 'done';
    
    switch (task.status) {
      case 'to-do':
        newStatus = 'in-progress';
        break;
      case 'in-progress':
        newStatus = 'done';
        break;
      case 'done':
        newStatus = 'to-do';
        break;
      default:
        newStatus = 'to-do';
    }
    
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
      {/* Checkbox - Apple Style - Status Cycle Indicator */}
      <div
        onClick={handleCheckboxClick}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
          task.status === 'to-do'
            ? 'border-gray-300 hover:border-blue-400 group-hover:border-blue-400 bg-transparent'
            : task.status === 'in-progress'
            ? 'bg-blue-500 border-blue-500 text-white shadow-sm hover:shadow-md'
            : task.status === 'done' && isOverdue
            ? 'bg-red-500 border-red-500 text-white shadow-sm hover:shadow-md'
            : 'bg-green-500 border-green-500 text-white shadow-sm hover:shadow-md'
        }`}
        title={`Status: ${task.status === 'to-do' ? 'To Do' : task.status === 'in-progress' ? 'In Progress' : 'Done'} - Click to cycle`}
      >
        {task.status === 'in-progress' && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
          </svg>
        )}
        {(task.status === 'done') && (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={isOverdue ? 2.5 : 3}
          >
            {isOverdue ? (
              // X icon for overdue
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              // Checkmark for completed on time
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            )}
          </svg>
        )}
      </div>

      {/* Task Title - Main Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-medium transition-colors duration-200 ${
          isClosed 
            ? 'text-gray-400 line-through' 
            : isOverdue
            ? 'text-red-600'
            : 'text-gray-900'
        }`}>
          {task.title}
        </h3>
        {/* Time Score Display - Clock Icon + Countdown Text (similar to regular Task) */}
        {task.end_time && task.status !== 'done' && !isOverdue && (
          <div className="mt-1 mb-2 text-xs flex items-center">
            <svg
              className="w-3 h-3 mr-1 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-amber-500 font-medium">
              {countdownText || formattedDeadline}
            </span>
          </div>
        )}
        {/* Overdue Status */}
        {isOverdue && (
          <div className="mt-1 mb-2 text-xs flex items-center">
            <svg
              className="w-3 h-3 mr-1 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-600 font-semibold">
              {countdownText}
            </span>
          </div>
        )}
      </div>

      {/* Assignee Avatars - Show all assigned members */}
      <div className="flex-shrink-0 flex items-center -space-x-2">
        {task.assigned_to_list && task.assigned_to_list.length > 0 ? (
          task.assigned_to_list.slice(0, 3).map((memberId) => {
            const member = workspaceMembers.find(m => m._id === memberId);
            return (
              <div
                key={memberId}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-2 border-white"
                title={member?.full_name || 'Unknown'}
              >
                {member?.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member?.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  member?.full_name?.[0]?.toUpperCase() || '?'
                )}
              </div>
            );
          })
        ) : assignedUser ? (
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-2 border-white"
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
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold border-2 border-white">
            -
          </div>
        )}
        {task.assigned_to_list && task.assigned_to_list.length > 3 && (
          <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold shadow-sm border-2 border-white">
            +{task.assigned_to_list.length - 3}
          </div>
        )}
      </div>

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
        {canEditTask() && (
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
        )}
        {canDeleteTask() && (
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
        )}
      </div>
    </li>
  );
};

export default WorkspaceTaskListItem;
