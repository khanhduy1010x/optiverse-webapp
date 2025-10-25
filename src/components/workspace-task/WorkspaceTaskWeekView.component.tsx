import React, { useState } from 'react';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface WorkspaceTaskWeekViewProps {
  workspaceId: string;
  tasks: WorkspaceTask[];
}

const WorkspaceTaskWeekView: React.FC<WorkspaceTaskWeekViewProps> = ({
  workspaceId,
  tasks,
}) => {
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
                  dayTasks.map(task => (
                    <div
                      key={task._id}
                      className={`p-2 rounded text-xs font-medium cursor-pointer hover:shadow-md transition-all ${getStatusBadgeColor(
                        task.status
                      )}`}
                      title={task.title}
                    >
                      <div className="truncate">{task.title}</div>
                      {task.assigned_to && (
                        <div className="text-xs mt-1 opacity-75">
                          {(task.assigned_to as any)?.name || 'Assigned'}
                        </div>
                      )}
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

export default WorkspaceTaskWeekView;
