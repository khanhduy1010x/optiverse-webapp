import React, { useMemo } from 'react';
import { CalendarProps, CalendarDay } from '../../types/datetime-picker';
import { useTheme } from '../../contexts/theme.context';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import Icon from '../common/Icon/Icon.component';

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  onClear,
  minDate,
  maxDate,
  currentMonth = new Date(),
  onMonthChange,
  className = '',
}) => {
  const { theme } = useTheme();
  const { t } = useAppTranslate('common');

  const monthNames = [
    t('january'), t('february'), t('march'), t('april'),
    t('may'), t('june'), t('july'), t('august'),
    t('september'), t('october'), t('november'), t('december')
  ];

  const dayNames = [
    t('sunday'), t('monday'), t('tuesday'), t('wednesday'),
    t('thursday'), t('friday'), t('saturday')
  ];

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? date.getTime() === selectedDate.getTime() : false,
        isDisabled: isDateDisabled(date),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? date.getTime() === selectedDate.getTime() : false,
        isDisabled: isDateDisabled(date),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? date.getTime() === selectedDate.getTime() : false,
        isDisabled: isDateDisabled(date),
      });
    }

    return days;
  }, [currentMonth, selectedDate, minDate, maxDate]);

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    onMonthChange?.(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    onMonthChange?.(nextMonth);
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.isDisabled) return;
    onDateSelect(day.date);
  };

  return (
    <div 
      className={`w-80 bg-white rounded-lg shadow-lg border p-4 ${className}`}
      style={{ 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        color: theme.colors.text 
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ 
            backgroundColor: 'transparent',
            color: theme.colors.text 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary + '20';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Icon name="chevron-left" size={20} />
        </button>
        
        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ 
            backgroundColor: 'transparent',
            color: theme.colors.text 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary + '20';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Icon name="chevron-right" size={20} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium py-2"
            style={{ color: theme.colors.text + '80' }}
          >
            {dayName.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            disabled={day.isDisabled}
            className={`
              h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              ${day.isToday ? 'ring-2 ring-blue-500' : ''}
              ${day.isSelected ? 'text-white' : ''}
              ${day.isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 cursor-pointer'}
            `}
            style={{
              backgroundColor: day.isSelected ? theme.colors.primary : 'transparent',
              color: day.isSelected ? theme.colors.onPrimary : 
                     day.isCurrentMonth ? theme.colors.text : theme.colors.text + '60',
            }}
            onMouseEnter={(e) => {
              if (!day.isDisabled && !day.isSelected) {
                e.currentTarget.style.backgroundColor = theme.colors.primary + '20';
              }
            }}
            onMouseLeave={(e) => {
              if (!day.isDisabled && !day.isSelected) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>

      {/* Footer with Today and Clear buttons */}
      {onClear && (
        <div className="flex justify-between items-center pt-3 mt-3 border-t" style={{ borderColor: theme.colors.border }}>
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-sm rounded-md transition-colors duration-200 hover:bg-red-50"
            style={{ color: '#dc2626' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {t('clear')}
          </button>
          <button
            onClick={() => onDateSelect(new Date())}
            className="px-3 py-1.5 text-sm rounded-md transition-colors duration-200 hover:bg-blue-50"
            style={{ color: theme.colors.primary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary + '20';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {t('today')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;