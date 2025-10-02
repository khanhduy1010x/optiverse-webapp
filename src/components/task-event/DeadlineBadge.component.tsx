import React from 'react';
import type { Task } from '../../types/task/response/task.response';

interface DeadlineBadgeProps {
  task: Task;
  onClick?: () => void;
  className?: string;
}

const DEADLINE_STYLE = {
  bg: 'from-red-500 to-red-600',
  border: 'border-red-400',
  icon: 'text-red-200',
};

const formatTime = (dateInput: string | Date) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
};

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({ task, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex items-center gap-2 rounded-md px-2 py-1 bg-gradient-to-r ${DEADLINE_STYLE.bg} border-l-4 ${DEADLINE_STYLE.border} shadow-sm hover:shadow-md transition-all duration-200 ${className || ''}`}
      title={`Deadline: ${task.title}`}
      aria-label={`Deadline for ${task.title}`}
    >
      <svg className={`w-3.5 h-3.5 ${DEADLINE_STYLE.icon}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      <span className="text-white text-xs font-semibold truncate max-w-[12rem]">
        {task.title}
      </span>
      {task.end_time && (
        <span className="text-white/90 text-[11px]">
          {formatTime(task.end_time)}
        </span>
      )}
      <span className="ml-auto text-white/80 text-[10px] uppercase tracking-wide">Deadline</span>
    </div>
  );
};