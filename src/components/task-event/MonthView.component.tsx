import React, { useMemo, useState } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from 'date-fns';
import { isSameLocalDay, ensureDate } from '../../utils/date.util';
import { CalendarEvent } from './CalendarEvent.component';
import { CalendarDeadlineEvent } from './CalendarDeadlineEvent.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import type { Task } from '../../types/task/response/task.response';
import { DeadlineBadge } from './DeadlineBadge.component';
import styles from './MonthView.module.css';

interface MonthViewProps {
  currentDate: Date;
  taskEvents: TaskEvent[];
  deadlineTasks: Task[];
  handleAddEvent: (date?: Date, hour?: number) => void;
  handleEditEvent: (event: TaskEvent) => void;
  onDeadlineClick?: (task: Task) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  taskEvents,
  deadlineTasks,
  handleAddEvent,
  handleEditEvent,
  onDeadlineClick
}) => {
  const { t } = useAppTranslate('task');
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(null);
  // Tạo mảng các ngày trong tháng (bao gồm cả ngày của tháng trước và tháng sau để hiển thị đủ lịch)
  const days = useMemo(() => {
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);

      const daysArray = [];
      let day = startDate;

      while (day <= endDate) {
        daysArray.push(day);
        day = addDays(day, 1);
      }

      return daysArray;
    } catch (error) {
      console.error('Error generating month days:', error);
      return [];
    }
  }, [currentDate]);

  // Hàm lấy màu sắc cho sự kiện
  const getEventColor = (event: TaskEvent) => {
    if (event.color) return event.color;
    
    // Màu mặc định dựa trên title nếu không có màu được chỉ định
    const colors = [
      'bg-blue-200 hover:bg-blue-300 border-blue-300 text-blue-800',
      'bg-green-200 hover:bg-green-300 border-green-300 text-green-800',
      'bg-purple-200 hover:bg-purple-300 border-purple-300 text-purple-800',
      'bg-red-200 hover:bg-red-300 border-red-300 text-red-800',
      'bg-yellow-200 hover:bg-yellow-300 border-yellow-300 text-yellow-800',
      'bg-pink-200 hover:bg-pink-300 border-pink-300 text-pink-800',
      'bg-indigo-200 hover:bg-indigo-300 border-indigo-300 text-indigo-800'
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

  // Kiểm tra xem một sự kiện có thuộc về một ngày cụ thể không
  const getEventsForDay = (day: Date) => {
    try {
      return taskEvents.filter(event => isSameLocalDay(ensureDate(event.start_time), day));
    } catch (error) {
      console.error('Error filtering events for day:', error, day);
      return [];
    }
  };

  // Hàm định dạng thời gian
  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Hàm tạo các hàng cho lịch
  const renderCalendarRows = () => {
    const rows: React.ReactNode[] = [];
    let cells: React.ReactNode[] = [];

    // Tên các ngày trong tuần (i18n)
    const weekDays = [
      t('day_sun'),
      t('day_mon'),
      t('day_tue'),
      t('day_wed'),
      t('day_thu'),
      t('day_fri'),
      t('day_sat'),
    ];

    // Tạo header cho lịch với weekday labels
    rows.push(
      <div key="header" className={styles.weekdayHeader}>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`${styles.weekdayCell} ${
              index === 0 || index === 6 ? styles.weekdaySunday : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    );

    // Tạo các ô cho từng ngày
    days.forEach((day, i) => {
      const dayEvents = getEventsForDay(day);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isTodayDate = isToday(day);
      
      const deadlinesForDay = (deadlineTasks || []).filter(t => {
        try {
          const timeToUse = t.start_time ? ensureDate(t.start_time) : (t.end_time ? ensureDate(t.end_time) : null);
          return timeToUse && isSameLocalDay(timeToUse, day);
        } catch {
          return false;
        }
      });
      
      cells.push(
        <div
          key={i}
          className={`${styles.dayCell} ${!isCurrentMonth ? styles.dayCellOtherMonth : ''}`}
        >
          {/* Hiển thị ngày */}
          <div className={`${styles.dayNumber} ${isTodayDate ? styles.dayNumberToday : ''} ${!isCurrentMonth ? styles.dayNumberOtherMonth : ''}`}>
            {format(day, 'd')}
          </div>

          {/* Hiển thị các deadline và sự kiện */}
          <div className={styles.eventListContainer}>
            {/* Deadlines first, max 2 unless expanded */}
            {(expandedDayIndex === i ? deadlinesForDay : deadlinesForDay.slice(0, 2)).map((task, idx) => (
              <CalendarDeadlineEvent
                key={task._id || `deadline-${i}-${idx}`}
                task={task}
                onClick={() => onDeadlineClick && onDeadlineClick(task)}
              />
            ))}
            {deadlinesForDay.length > 2 && expandedDayIndex !== i && (
              <div 
                className={styles.moreButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedDayIndex(i);
                }}
              >
                +{deadlinesForDay.length - 2} {t('more')}
              </div>
            )}

            {/* Events, max 3 unless expanded */}
            {(expandedDayIndex === i ? dayEvents : dayEvents.slice(0, 3)).map((event, index) => (
              <CalendarEvent
                key={event._id || index}
                event={event}
                onClick={() => handleEditEvent(event)}
              />
            ))}
            {dayEvents.length > 3 && expandedDayIndex !== i && (
              <div
                className={styles.moreButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedDayIndex(i);
                }}
              >
                +{dayEvents.length - 3} {t('more')}
              </div>
            )}
          </div>
        </div>
      );

      // Tạo hàng mới sau mỗi 7 ô
      if ((i + 1) % 7 === 0) {
        rows.push(
          <div key={`row-${i}`} className={styles.calendarGrid}>
            {cells}
          </div>
        );
        cells = [];
      }
    });

    // Thêm hàng cuối cùng nếu còn cells
    if (cells.length > 0) {
      rows.push(
        <div key="last-row" className={styles.calendarGrid}>
          {cells}
        </div>
      );
    }

    return rows;
  };

  return (
    <div className={styles.monthViewContainer}>
      {/* Header với tháng và năm */}
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>
      {/* Lưới lịch */}
      <div className="flex-grow overflow-auto">
        {renderCalendarRows()}
      </div>
    </div>
  );
};