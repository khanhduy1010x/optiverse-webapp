import React from 'react';
import type { Task } from '../../types/task/response/task.response';

interface CalendarDeadlineEventProps {
  task: Task;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

// Theme colors per task status
const STATUS_COLOR: Record<'pending' | 'completed' | 'overdue', { bg: string; border: string; icon: string }> = {
  pending: {
    bg: 'from-blue-500 to-blue-600',
    border: 'border-blue-400',
    icon: 'text-blue-200',
  },
  completed: {
    bg: 'from-green-500 to-green-600',
    border: 'border-green-400',
    icon: 'text-green-200',
  },
  overdue: {
    bg: 'from-red-500 to-red-600',
    border: 'border-red-400',
    icon: 'text-red-200',
  },
};

const formatDeadlineTime = (dateInput: string | Date) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
};

export const CalendarDeadlineEvent: React.FC<CalendarDeadlineEventProps> = ({
  task,
  onClick,
  style,
  className
}) => {
  const colorSet = STATUS_COLOR[task.status || 'pending'];
  const statusLabel = (task.status || 'pending').toUpperCase();
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex flex-col items-start rounded-lg p-2 bg-gradient-to-r ${colorSet.bg} border-l-4 ${colorSet.border} shadow-sm hover:shadow-md transition-all duration-200 ${className || ''}`}
      style={style}
      title={`${statusLabel}: ${task.title}`}
    >
      <div className="flex items-center w-full">
        <div className="mr-2">
          <svg className={`w-3.5 h-3.5 ${colorSet.icon}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="font-bold text-white text-sm leading-tight truncate flex-1">{task.title || 'Untitled Task'}</div>
      </div>
      {task.end_time && (
        <div className="text-xs text-white/90 mt-1 ml-5.5">
          {formatDeadlineTime(task.end_time)}
          <span className="ml-2 uppercase tracking-wide text-[10px] text-white/80">{statusLabel}</span>
        </div>
      )}
    </div>
  );
};