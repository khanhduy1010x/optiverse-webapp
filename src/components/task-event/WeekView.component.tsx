import React, { useMemo } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { format, addDays, startOfWeek, isToday as isDateToday } from 'date-fns';
import { isSameLocalDay, ensureDate } from '../../utils/date.util';
import { CalendarEvent } from './CalendarEvent.component';
import type { Task } from '../../types/task/response/task.response';
import { CalendarDeadlineEvent } from './CalendarDeadlineEvent.component';
import styles from './WeekView.module.css';

interface WeekViewProps {
  currentDate: Date;
  currentTime: Date;
  taskEvents: TaskEvent[];
  deadlineTasks: Task[];
  handleAddEvent: (date?: Date, hour?: number) => void;
  handleEditEvent: (event: TaskEvent) => void;
  onDeadlineClick?: (task: Task) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  currentTime,
  taskEvents,
  deadlineTasks,
  handleAddEvent,
  handleEditEvent,
  onDeadlineClick
}) => {
  // Tạo mảng các ngày trong tuần
  const weekDays = useMemo(() => {
    try {
      const startDate = startOfWeek(currentDate);
      return Array.from({ length: 7 }).map((_, index) => addDays(startDate, index));
    } catch (error) {
      console.error('Error generating week days:', error);
      // Fallback: Tạo mảng 7 ngày từ ngày hiện tại
      const today = new Date();
      return Array.from({ length: 7 }).map((_, index) => {
        const day = new Date(today);
        day.setDate(today.getDate() - today.getDay() + index);
        return day;
      });
    }
  }, [currentDate]);

  // Tạo mảng các giờ trong ngày
  const hours = useMemo(() => {
    return Array.from({ length: 24 }).map((_, index) => index);
  }, []);

  // Kiểm tra xem một sự kiện có thuộc về một ngày cụ thể không
  const isEventInDay = (event: TaskEvent, day: Date) => {
    try {
      return isSameLocalDay(ensureDate(event.start_time), day);
    } catch (error) {
      console.error('Error checking if event is in day:', error, event, day);
      return false;
    }
  };

  // Kiểm tra xem hiện tại có phải là giờ hiện tại không
  const isCurrentHour = (day: Date, hour: number) => {
    try {
      return (
        currentTime.getHours() === hour &&
        currentTime.getDate() === day.getDate() &&
        currentTime.getMonth() === day.getMonth() &&
        currentTime.getFullYear() === day.getFullYear()
      );
    } catch (error) {
      console.error('Error checking if current hour:', error, day, hour);
      return false;
    }
  };

  // Hàm lấy màu sắc cho sự kiện
  const getEventColor = (event: TaskEvent) => {
    if (event.color) return event.color;
    
    // Màu mặc định dựa trên title nếu không có màu được chỉ định
    const colors = [
      'bg-blue-200 hover:bg-blue-300 border-blue-300',
      'bg-green-200 hover:bg-green-300 border-green-300',
      'bg-purple-200 hover:bg-purple-300 border-purple-300',
      'bg-red-200 hover:bg-red-300 border-red-300',
      'bg-yellow-200 hover:bg-yellow-300 border-yellow-300',
      'bg-pink-200 hover:bg-pink-300 border-pink-300',
      'bg-indigo-200 hover:bg-indigo-300 border-indigo-300'
    ];
    
    // Tạo một số ngẫu nhiên nhưng nhất quán dựa trên title
    let hash = 0;
    for (let i = 0; i < event.title.length; i++) {
      hash = ((hash << 5) - hash) + event.title.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Lấy màu từ mảng màu
    return colors[Math.abs(hash) % colors.length];
  };

  // Hàm định dạng thời gian
  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={styles.weekViewContainer}>
      {/* Header với các ngày trong tuần */}
      <div className={styles.header}>
        <div className={styles.headerTimeSidebar}></div>
        {weekDays.map((day, index) => {
          const isToday = isDateToday(day);
          return (
            <div key={index} className={styles.headerDay}>
              <div className={styles.dayLabel}>{format(day, 'EEE')}</div>
              <div className={`${styles.dayNumber} ${isToday ? styles.dayNumberToday : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lưới thời gian */}
      <div className={styles.gridContainer}>
        {hours.map((hour) => (
          <div key={hour} className={styles.timeRowContainer}>
            <div className={styles.timeCell}>
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
            {weekDays.map((day, dayIndex) => {
              const isCurrentTimeCell = isCurrentHour(day, hour);
              const isWorkingHour = hour >= 9 && hour <= 17;
              
              const eventsInCell = taskEvents.filter(event => {
                try {
                  const eventDate = new Date(event.start_time);
                  const eventHour = eventDate.getHours();
                  return isEventInDay(event, day) && eventHour === hour;
                } catch (error) {
                  return false;
                }
              });
              
              const tasksInCell = (deadlineTasks || []).filter(task => {
                try {
                  if (task.start_time) {
                    const taskDate = new Date(task.start_time);
                    const taskHour = taskDate.getHours();
                    return isSameLocalDay(taskDate, day) && taskHour === hour;
                  }
                  if (task.end_time) {
                    const d = ensureDate(task.end_time);
                    return isSameLocalDay(d, day) && d.getHours() === hour;
                  }
                  return false;
                } catch {
                  return false;
                }
              });
              
              return (
                <div
                  key={dayIndex}
                  className={`${styles.dayCell} ${
                    isCurrentTimeCell ? styles.currentTimeCell : ''
                  } ${isWorkingHour && !isCurrentTimeCell ? styles.workingHours : ''}`}
                >
                  {/* Current time indicator */}
                  {isCurrentTimeCell && (
                    <div
                      className={styles.currentTimeIndicator}
                      style={{
                        top: `${(currentTime.getMinutes() / 60) * 100}%`,
                      } as React.CSSProperties}
                    ></div>
                  )}

                  {/* Events container */}
                  <div className={styles.eventContainer}>
                    {eventsInCell.map((event, eventIndex) => (
                      <CalendarEvent
                        key={event._id || eventIndex}
                        event={event}
                        onClick={() => handleEditEvent(event)}
                        className="w-full"
                      />
                    ))}
                    {tasksInCell.map((task, idx) => (
                      <CalendarDeadlineEvent
                        key={task._id || `deadline-${dayIndex}-${hour}-${idx}`}
                        task={task}
                        onClick={() => onDeadlineClick && onDeadlineClick(task)}
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};