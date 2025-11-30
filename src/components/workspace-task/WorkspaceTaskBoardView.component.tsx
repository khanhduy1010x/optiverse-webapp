import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { updateTaskStatus } from '../../store/slices/workspace_task.slice';
import { format } from 'date-fns';
import { useWorkspaceTaskCountdown } from '../../hooks/workspace-task/useWorkspaceTaskCountdown';

interface WorkspaceTaskBoardViewProps {
  workspaceId: string;
  tasks: WorkspaceTask[];
  tasksByStatus: {
    'to-do': WorkspaceTask[];
    'in-progress': WorkspaceTask[];
    done: WorkspaceTask[];
  };
  workspaceMembers?: Array<{ _id: string; full_name: string; email: string; avatar_url?: string }>;
  onTaskClick?: (task: WorkspaceTask) => void;
}

const WorkspaceTaskBoardView: React.FC<WorkspaceTaskBoardViewProps> = ({
  workspaceId,
  tasks,
  tasksByStatus,
  workspaceMembers = [],
  onTaskClick,
}) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  const [draggedTask, setDraggedTask] = React.useState<WorkspaceTask | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);

  const columns = [
    { 
      id: 'to-do', 
      title: t('workspace_task.columns.to_do'),
      color: 'bg-gray-50',
      headerColor: 'text-gray-700',
      badge: 'bg-gray-600',
      borderColor: 'border-gray-200',
      hoverColor: 'hover:bg-gray-100/50'
    },
    { 
      id: 'in-progress', 
      title: t('workspace_task.columns.in_progress'),
      color: 'bg-blue-50',
      headerColor: 'text-blue-700',
      badge: 'bg-blue-600',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100/50'
    },
    { 
      id: 'done', 
      title: t('workspace_task.columns.done'),
      color: 'bg-green-50',
      headerColor: 'text-green-700',
      badge: 'bg-green-600',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100/50'
    },
  ];

  const handleDragStart = (task: WorkspaceTask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (status: 'to-do' | 'in-progress' | 'done') => {
    if (draggedTask && draggedTask.status !== status) {
      dispatch(updateTaskStatus({
        workspaceId,
        taskId: draggedTask._id,
        status,
      }));
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Handle status cycle: to-do → in-progress → done → to-do
  const handleStatusCycle = (task: WorkspaceTask, e: React.MouseEvent) => {
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
    <div className="w-full h-full flex flex-col">
      {/* Board Grid - Full Screen */}
      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
        {columns.map((column) => {
          const columnTasks = tasksByStatus[column.id as keyof typeof tasksByStatus] || [];
          const isOverColumn = dragOverColumn === column.id;
          
          // Get border color based on column ID
          let borderStyle = '';
          if (column.id === 'to-do') {
            borderStyle = 'border-l-4 border-l-gray-400';
          } else if (column.id === 'in-progress') {
            borderStyle = 'border-l-4 border-l-blue-500';
          } else if (column.id === 'done') {
            borderStyle = 'border-l-4 border-l-green-500';
          }

          return (
            <div
              key={column.id}
              className={`flex flex-col min-h-0 bg-white rounded-lg ${borderStyle} shadow-sm`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(column.id as any)}
            >
              {/* Column Header - Apple Style */}
              <div className={`flex-shrink-0 pb-4 px-4 pt-4 border-b-2 ${
                column.id === 'to-do' ? 'border-b-gray-400' : 
                column.id === 'in-progress' ? 'border-b-blue-500' : 
                'border-b-green-500'
              }`}>
                <div className="flex items-center gap-2.5">
                  <h3 className={`text-base font-semibold ${column.headerColor} tracking-tight`}>
                    {column.title}
                  </h3>
                  <span className={`ml-auto ${column.badge} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Cards - Scrollable */}
              <div className={`flex-1 flex flex-col gap-3 p-4 overflow-y-auto
                ${isOverColumn ? `bg-${column.id === 'to-do' ? 'gray' : column.id === 'in-progress' ? 'blue' : 'green'}-100/40` : ''} 
                transition-colors duration-200`}
              >
                {columnTasks.length === 0 ? (
                  <div className={`flex items-center justify-center flex-1 rounded-lg border-2 border-dashed ${column.borderColor}`}>
                    <div className="text-center space-y-2">
                      <p className="text-gray-400 text-sm font-medium">{t('workspace_task.no_tasks_status')}</p>
                      <p className="text-gray-300 text-xs">{t('workspace_task.drag_tasks_here')}</p>
                    </div>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    // Get assigned members from assigned_to_list
                    const assignedMembers = task.assigned_to_list?.map(memberId =>
                      workspaceMembers.find(m => m._id === memberId)
                    ).filter(Boolean) || [];

                    // Fallback to single assigned_to for backward compatibility
                    const assignedUser = task.assigned_to 
                      ? workspaceMembers.find(m => m._id === task.assigned_to)
                      : null;

                    // Get overdue status
                    const { isOverdue } = useWorkspaceTaskCountdown(task, workspaceId);

                    return (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onClick={() => onTaskClick?.(task)}
                      className={`flex-shrink-0 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-move border border-gray-200 hover:border-gray-300 group ${
                        draggedTask?._id === task._id ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        {/* Status Indicator - Clickable Circle */}
                        <div
                          onClick={(e) => handleStatusCycle(task, e)}
                          className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                            task.status === 'to-do'
                              ? 'border-gray-300 hover:border-blue-400 bg-transparent'
                              : task.status === 'in-progress'
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : isOverdue
                              ? 'bg-red-500 border-red-500 text-white'
                              : 'bg-green-500 border-green-500 text-white'
                          }`}
                          title={`Status: ${task.status === 'to-do' ? 'To Do' : task.status === 'in-progress' ? 'In Progress' : 'Done'} - Click to cycle`}
                        >
                          {task.status === 'in-progress' && (
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="4" />
                            </svg>
                          )}
                          {task.status === 'done' && (
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              {isOverdue ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              )}
                            </svg>
                          )}
                        </div>

                        <h4 className={`font-medium text-sm line-clamp-2 flex-1 ${
                          task.status === 'done' && isOverdue
                            ? 'text-red-600'
                            : task.status === 'done'
                            ? 'text-gray-400 line-through'
                            : isOverdue
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h4>
                        <div className={`flex-shrink-0 ${
                          task.status === 'done' && isOverdue
                            ? 'text-red-500'
                            : 'text-gray-300 group-hover:text-gray-400'
                        }`}>
                          {task.status === 'done' && isOverdue ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                            </svg>
                          ) : isOverdue ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 3h2v2H9V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm4 0h2v2h-2V7zM9 11h2v2H9v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Task Description */}
                      {task.description && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Task Meta - Compact */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                        {/* Assignee Avatars - Show first 2 + badge if 3+ */}
                        <div className="flex items-center -space-x-2">
                          {assignedMembers.length > 0 ? (
                            <>
                              {assignedMembers.slice(0, 2).map((member) => (
                                <div
                                  key={member?._id}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden border-2 border-white shadow-sm"
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
                              ))}
                              {assignedMembers.length > 2 && (
                                <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold flex-shrink-0 border-2 border-white shadow-sm">
                                  +{assignedMembers.length - 2}
                                </div>
                              )}
                            </>
                          ) : assignedUser ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden border-2 border-white shadow-sm"
                              title={`Assigned to ${assignedUser.full_name}`}>
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
                            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold border-2 border-white">
                              -
                            </div>
                          )}
                        </div>

                        {/* Time */}
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {task.updatedAt ? (
                            format(new Date(task.updatedAt), 'MMM dd')
                          ) : (
                            '-'
                          )}
                        </span>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkspaceTaskBoardView;
