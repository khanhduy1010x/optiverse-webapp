import React, { useMemo } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { format } from 'date-fns';
import { ensureDate, isSameLocalDay } from '../../utils/date.util';
import { CalendarEvent } from './CalendarEvent.component';
import type { Task } from '../../types/task/response/task.response';
import { CalendarDeadlineEvent } from './CalendarDeadlineEvent.component';
import styles from './DayView.module.css';

interface DayViewProps {
  currentDate: Date;
  currentTime: Date;
  taskEvents: TaskEvent[];
  deadlineTasks: Task[];
  handleAddEvent: (date?: Date, hour?: number) => void;
  handleEditEvent: (event: TaskEvent) => void;
  onDeadlineClick?: (task: Task) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  currentTime,
  taskEvents,
  deadlineTasks,
  handleAddEvent,
  handleEditEvent,
  onDeadlineClick
}) => {
  const hours = useMemo(() => {
    return Array.from({ length: 24 }).map((_, index) => index);
  }, []);

  const getCalculatedPosition = (minutes: number) => {
    return (minutes / 1440) * 100;
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className={styles.dayViewContainer}>
      <div className={styles.header}>
        <div className={styles.headerSidebar}></div>
        <div className={styles.headerContent}>
          <div className={styles.headerDate}>{format(currentDate, 'EEEE')}</div>
          <div className={styles.headerTitle}>{format(currentDate, 'MMMM d, yyyy')}</div>
        </div>
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.timeSidebar}>
          {hours.map((hour) => (
            <div key={hour} className={styles.timeLabel}>
              <span>{formatHour(hour)}</span>
            </div>
          ))}
        </div>

        <div className={styles.hoursGrid}>
          {hours.map((hour) => (
            <div key={hour} className={styles.hourLine}></div>
          ))}

          {taskEvents.map((event, idx) => {
            const start = new Date(event.start_time);
            const end = event.end_time ? new Date(event.end_time) : new Date(start.getTime() + 30*60000);
            const startMinutes = start.getHours() * 60 + start.getMinutes();
            const endMinutes = end.getHours() * 60 + end.getMinutes();
            const topPercent = getCalculatedPosition(startMinutes);
            const heightPercent = Math.max(2.2, ((endMinutes - startMinutes) / 1440) * 100);
            
            return (
              <div
                key={event._id || idx}
                className={styles.eventContainer}
                style={{ top: `${topPercent}%`, height: `calc(${heightPercent}% + 1px)` }}
              >
                <CalendarEvent
                  event={event}
                  onClick={() => handleEditEvent(event)}
                  className={styles.eventWrapper}
                />
              </div>
            );
          })}

          {(deadlineTasks || []).filter(t => {
            if (!t.start_time && !t.end_time) return false;
            try {
              const timeToUse = t.start_time ? ensureDate(t.start_time) : ensureDate(t.end_time);
              return isSameLocalDay(timeToUse, currentDate);
            } catch {
              return false;
            }
          }).map((task, idx) => {
            try {
              const timeToUse = task.start_time ? new Date(task.start_time) : ensureDate(task.end_time);
              const startHour = timeToUse.getHours();
              const startMinutes = timeToUse.getMinutes();
              const topPercent = getCalculatedPosition(startHour * 60 + startMinutes);
              
              let heightValue = 32;
              if (task.start_time && task.end_time) {
                const start = new Date(task.start_time);
                const end = ensureDate(task.end_time);
                const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
                heightValue = Math.max(32, (durationMinutes / 1440) * 100);
              }

              return (
                <div
                  key={task._id || `deadline-${idx}`}
                  className={styles.deadlineContainer}
                  style={{ top: `${topPercent}%`, height: `${heightValue}px` }}
                >
                  <CalendarDeadlineEvent
                    task={task}
                    onClick={() => onDeadlineClick && onDeadlineClick(task)}
                    className={styles.eventWrapper}
                  />
                </div>
              );
            } catch (error) {
              return null;
            }
          })}
        </div>
      </div>
    </div>
  );
};
