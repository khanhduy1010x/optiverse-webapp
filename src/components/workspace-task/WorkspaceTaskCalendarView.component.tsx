import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { updateTask, updateTaskStatus } from '../../store/slices/workspace_task.slice';
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths } from 'date-fns';
import { useWorkspaceTaskCountdown } from '../../hooks/workspace-task/useWorkspaceTaskCountdown';

interface WorkspaceTaskCalendarViewProps {
  workspaceId: string;
  tasks: WorkspaceTask[];
  onTaskClick?: (task: WorkspaceTask) => void;
}

const WorkspaceTaskCalendarView: React.FC<WorkspaceTaskCalendarViewProps> = ({
  workspaceId,
  tasks,
  onTaskClick,
}) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState<WorkspaceTask | null>(null);

  const monthStart = startOfMonth(currentDate);
  const daysInMonth = getDaysInMonth(monthStart);
  const startingDayOfWeek = getDay(monthStart);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = format(currentDate, 'MMMM yyyy');

  // Group tasks by date - using createdAt as fallback, ideal would be dueDate
  const getTasksForDate = (day: number) => {
    return tasks.filter(task => {
      if (!task.createdAt) return false;
      const taskDate = new Date(task.createdAt);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === monthStart.getMonth() &&
        taskDate.getFullYear() === monthStart.getFullYear()
      );
    });
  };

  // Get task count for date
  const getTaskCountForDate = (day: number) => {
    const dayTasks = getTasksForDate(day);
    return {
      total: dayTasks.length,
      todo: dayTasks.filter(t => t.status === 'to-do').length,
      inProgress: dayTasks.filter(t => t.status === 'in-progress').length,
      done: dayTasks.filter(t => t.status === 'done').length,
    };
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'to-do':
        return 'bg-gray-200 text-gray-800';
      case 'in-progress':
        return 'bg-blue-200 text-blue-800';
      case 'done':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'to-do':
        return 'bg-gray-100';
      case 'in-progress':
        return 'bg-blue-50';
      case 'done':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
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

  // Handle drag start
  const handleDragStart = (task: WorkspaceTask, e: React.DragEvent) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drop on date
  const handleDrop = (day: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTask) {
      const newDate = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        day
      );
      // Update task with new date (in real scenario, would need a dueDate field)
      console.log(`Moving task ${draggedTask._id} to ${format(newDate, 'yyyy-MM-dd')}`);
      setDraggedTask(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Previous month"
        >
          ←
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
        
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Next month"
        >
          →
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-0 border-b border-gray-200 bg-gray-50">
        {days.map(day => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-0 overflow-auto">
        {calendarDays.map((day, index) => {
          const dayTaskCount = day ? getTaskCountForDate(day) : null;
          return (
            <div
              key={index}
              className={`border border-gray-200 p-2 min-h-[120px] ${
                day ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'
              } transition-colors`}
              onDragOver={day ? handleDragOver : undefined}
              onDrop={day ? (e) => handleDrop(day, e) : undefined}
            >
              {day && (
                <>
                  {/* Day Number and Indicators */}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-gray-900">{day}</span>
                    <div className="flex gap-1">
                      {/* Today indicator */}
                      {new Date().getDate() === day &&
                        new Date().getMonth() === monthStart.getMonth() &&
                        new Date().getFullYear() === monthStart.getFullYear() && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                    </div>
                  </div>

                  {/* Task count mini bar */}
                  {dayTaskCount && dayTaskCount.total > 0 && (
                    <div className="flex gap-0.5 mb-1 text-xs">
                      {dayTaskCount.todo > 0 && (
                        <span className="px-1 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                          {dayTaskCount.todo}
                        </span>
                      )}
                      {dayTaskCount.inProgress > 0 && (
                        <span className="px-1 py-0.5 bg-blue-200 text-blue-700 rounded text-xs font-medium">
                          {dayTaskCount.inProgress}
                        </span>
                      )}
                      {dayTaskCount.done > 0 && (
                        <span className="px-1 py-0.5 bg-green-200 text-green-700 rounded text-xs font-medium">
                          {dayTaskCount.done}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tasks for this day */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px]">
                    {getTasksForDate(day).map(task => {
                      // Get overdue status for this task
                      const { isOverdue } = useWorkspaceTaskCountdown(task, workspaceId);
                      
                      return (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(task, e)}
                        onClick={() => onTaskClick?.(task)}
                        className={`p-1.5 rounded text-xs font-medium cursor-move hover:shadow-md transition-all truncate flex items-start gap-1 ${
                          task.status === 'done' && isOverdue
                            ? 'bg-red-200 text-red-800'
                            : getStatusColor(task.status)
                        }`}
                        title={`${task.title}${task.status === 'done' && isOverdue ? ' (Overdue)' : ''}`}
                      >
                        {/* Status Indicator Circle */}
                        <div
                          onClick={(e) => handleStatusCycle(task, e)}
                          className={`flex-shrink-0 w-2 h-2 rounded-full border mt-0.5 flex items-center justify-center cursor-pointer transition-all ${
                            task.status === 'to-do'
                              ? 'border-current opacity-40'
                              : task.status === 'in-progress'
                              ? 'border-current'
                              : 'border-current'
                          }`}
                        />

                        <span className="truncate flex-1">
                          {task.status === 'done' && isOverdue && '⚠️ '}
                          {task.title}
                        </span>
                      </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 items-center justify-center p-4 border-t border-gray-200 bg-gray-50 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-200"></div>
          <span className="text-gray-600">To Do</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-200"></div>
          <span className="text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-200"></div>
          <span className="text-gray-600">Done</span>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceTaskCalendarView;
