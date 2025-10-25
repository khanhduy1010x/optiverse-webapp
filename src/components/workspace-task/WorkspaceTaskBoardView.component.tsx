import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { updateTaskStatus } from '../../store/slices/workspace_task.slice';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface WorkspaceTaskBoardViewProps {
  workspaceId: string;
  tasks: WorkspaceTask[];
  tasksByStatus: {
    'to-do': WorkspaceTask[];
    'in-progress': WorkspaceTask[];
    done: WorkspaceTask[];
  };
}

const WorkspaceTaskBoardView: React.FC<WorkspaceTaskBoardViewProps> = ({
  workspaceId,
  tasks,
  tasksByStatus,
}) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  const [draggedTask, setDraggedTask] = React.useState<WorkspaceTask | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);

  const columns = [
    { 
      id: 'to-do', 
      title: 'To Do', 
      icon: '○',
      color: 'bg-gray-50',
      headerColor: 'text-gray-700',
      badge: 'bg-gray-600',
      borderColor: 'border-gray-200',
      hoverColor: 'hover:bg-gray-100/50'
    },
    { 
      id: 'in-progress', 
      title: 'In Progress', 
      icon: '●',
      color: 'bg-blue-50',
      headerColor: 'text-blue-700',
      badge: 'bg-blue-600',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100/50'
    },
    { 
      id: 'done', 
      title: 'Done', 
      icon: '✓',
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

  return (
    <div className="w-full h-full flex flex-col">
      {/* Board Grid - Full Screen */}
      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {columns.map((column) => {
          const columnTasks = tasksByStatus[column.id as keyof typeof tasksByStatus] || [];
          const isOverColumn = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className="flex flex-col min-h-0"
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(column.id as any)}
            >
              {/* Column Header - Apple Style */}
              <div className="flex-shrink-0 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className={`text-lg font-semibold ${column.headerColor}`}>
                    {column.icon}
                  </span>
                  <h3 className={`text-base font-semibold ${column.headerColor} tracking-tight`}>
                    {column.title}
                  </h3>
                  <span className={`ml-auto ${column.badge} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Cards - Scrollable */}
              <div className={`flex-1 flex flex-col gap-3 pb-4 overflow-y-auto pr-2 
                ${isOverColumn ? `bg-${column.id === 'to-do' ? 'gray' : column.id === 'in-progress' ? 'blue' : 'green'}-100/40` : ''} 
                rounded-xl transition-colors duration-200`}
              >
                {columnTasks.length === 0 ? (
                  <div className={`flex items-center justify-center flex-1 rounded-lg border-2 border-dashed ${column.borderColor}`}>
                    <div className="text-center space-y-2">
                      <p className="text-gray-400 text-sm font-medium">No tasks</p>
                      <p className="text-gray-300 text-xs">Drag tasks here</p>
                    </div>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      className={`flex-shrink-0 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-move border border-gray-200 hover:border-gray-300 group ${
                        draggedTask?._id === task._id ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1">
                          {task.title}
                        </h4>
                        <div className="text-gray-300 group-hover:text-gray-400 flex-shrink-0">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 3h2v2H9V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm4 0h2v2h-2V7zM9 11h2v2H9v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
                          </svg>
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
                        {/* Assignee */}
                        {task.assigned_to ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {(task.assigned_to as any)?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-xs text-gray-600 truncate">
                              {(task.assigned_to as any)?.name?.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Unassigned</span>
                        )}

                        {/* Time */}
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatDistanceToNow(new Date(task.updatedAt), { locale: vi })}
                        </span>
                      </div>
                    </div>
                  ))
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
