import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useWorkspaceTaskCountdown } from '../../hooks/workspace-task/useWorkspaceTaskCountdown';
import { updateTaskStatus } from '../../store/slices/workspace_task.slice';

interface WorkspaceTaskWeekViewProps {
  workspaceId: string;
  tasks: WorkspaceTask[];
  onTaskClick?: (task: WorkspaceTask) => void;
}

const WorkspaceTaskWeekView: React.FC<WorkspaceTaskWeekViewProps> = ({
  workspaceId,
  tasks,
  onTaskClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.createdAt) return false;
      return isSameDay(new Date(task.createdAt), date);
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'to-do':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Week Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
          className="px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          ← Previous Week
        </button>

        <span className="text-lg font-semibold text-gray-900">
          Week of {format(currentWeekStart, 'MMM dd, yyyy')}
        </span>

        <button
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
          className="px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Next Week →
        </button>
      </div>

      {/* Week Grid */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200 overflow-auto">
        {weekDays.map((date, idx) => {
          const dayTasks = getTasksForDate(date);
          const today = isToday(date);

          return (
            <div
              key={idx}
              className={`${today ? 'bg-blue-50' : 'bg-white'} p-3 border border-gray-200 flex flex-col`}
            >
              {/* Day Header */}
              <div className={`text-sm font-semibold mb-2 pb-2 border-b ${
                today ? 'border-blue-300 text-blue-700' : 'border-gray-200 text-gray-900'
              }`}>
                <div>{format(date, 'EEE')}</div>
                <div className={`text-lg font-bold ${today ? 'text-blue-600' : ''}`}>
                  {format(date, 'd')}
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2 overflow-y-auto flex-1">
                {dayTasks.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">No tasks</div>
                ) : (
                  dayTasks.map(task => {
                    // Get overdue status for this task
                    const { isOverdue } = useWorkspaceTaskCountdown(task, workspaceId);
                    
                    return (
                    <div
                      key={task._id}
                      onClick={() => onTaskClick?.(task)}
                      className={`p-2 rounded text-xs font-medium cursor-pointer hover:shadow-md transition-all flex items-start gap-1.5 ${
                        task.status === 'done' && isOverdue
                          ? 'bg-red-100 text-red-800'
                          : getStatusBadgeColor(task.status)
                      }`}
                      title={`${task.title}${task.status === 'done' && isOverdue ? ' (Overdue)' : ''}`}
                    >
                      {/* Status Indicator Circle */}
                      <div
                        onClick={(e) => handleStatusCycle(task, e)}
                        className={`flex-shrink-0 w-2.5 h-2.5 rounded-full border mt-1 flex items-center justify-center cursor-pointer transition-all ${
                          task.status === 'to-do'
                            ? 'border-current opacity-40'
                            : task.status === 'in-progress'
                            ? 'border-current'
                            : 'border-current'
                        }`}
                      />
                      
                      <div className="flex-1 truncate">
                        {task.status === 'done' && isOverdue && '⚠️ '}
                        {task.title}
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

export default WorkspaceTaskWeekView;
