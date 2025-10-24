import React from 'react';
import type { Task } from '../../types/task/response/task.response';
import styles from './CalendarDeadlineEvent.module.css';

interface CalendarDeadlineEventProps {
  task: Task;
  onClick?: () => void;
  className?: string;
}

export const CalendarDeadlineEvent: React.FC<CalendarDeadlineEventProps> = ({
  task,
  onClick,
  className
}) => {
  const status = (task.status || 'pending') as 'pending' | 'completed' | 'overdue';
  const statusClass = styles[status as keyof typeof styles];
  const dotClass = styles[`${status}Dot` as keyof typeof styles];
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  
  const formatDeadlineTime = (dateInput: string | Date | undefined) => {
    if (!dateInput) return '';
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  };

  const isCompleted = status === 'completed';
  
  return (
    <div
      onClick={onClick}
      className={`${styles.deadlineCard} ${statusClass} ${className || ''}`}
      title={`${statusLabel}: ${task.title}`}
    >
      <div className={styles.deadlineContent}>
        {/* Checkbox-style indicator for tasks */}
        <div className={`${styles.deadlineDot} ${dotClass}`}>
          {isCompleted && <span>✓</span>}
        </div>
        <div className={styles.deadlineBody}>
          <p className={`${styles.deadlineTitle} ${isCompleted ? 'line-through opacity-60' : ''}`}>
            {task.title || 'Untitled Task'}
          </p>
          {(task.start_time || task.end_time) && (
            <div className={styles.deadlineInfo}>
              <p className={styles.deadlineTime}>{formatDeadlineTime(task.start_time || task.end_time)}</p>
              <span className={`${styles.statusBadge} ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};