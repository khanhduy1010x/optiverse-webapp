import React, { useState } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface CalendarDatePickerProps {
  selectedDate?: Date;
  onDateSelected: (date: Date) => void;
  onClear?: () => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  selectedDate,
  onDateSelected,
  onClear,
  className = '',
  isOpen = true,
  onClose
}) => {
  const { t } = useAppTranslate('datetime-picker');
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  // If not open, don't render
  if (!isOpen) {
    return null;
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    // Always render 6 weeks (42 cells)
    const totalCellsTarget = 42;
    let nextMonthDay = 1;
    while (days.length < totalCellsTarget) {
      days.push({ date: new Date(year, month + 1, nextMonthDay++), isCurrentMonth: false });
    }

    return days;
  };

  const handleTodayClick = () => {
    const today = new Date();
    onDateSelected(today);
  };

  const handleDeleteClick = () => {
    if (onClear) {
      onClear();
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 min-h-[320px] ${className}`}>
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title={t('previous')}
          aria-label={t('previous')}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-800">{monthYear}</h3>
        <button
          type="button"
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title={t('next')}
          aria-label={t('next')}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 auto-rows-fr">
        {days.map((dayObj, index) => {
          const { date, isCurrentMonth } = dayObj;
          const selected = isSelectedDate(date);
          const today = isToday(date);

          return (
            <button
              type="button"
              key={index}
              onClick={() => onDateSelected(date)}
              className={`
                w-10 h-10 text-sm rounded-full transition-all duration-200 hover:bg-blue-50 flex items-center justify-center
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${selected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                ${today && !selected ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                ${isCurrentMonth && !selected && !today ? 'hover:bg-gray-100' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Footer with Today and Delete buttons */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <button
          type="button"
          onClick={handleDeleteClick}
          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
          aria-label={t('delete')}
        >
          {t('delete')}
        </button>
        <button
          type="button"
          onClick={handleTodayClick}
          className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
          aria-label={t('today')}
        >
          {t('today')}
        </button>
      </div>
    </div>
  );
};