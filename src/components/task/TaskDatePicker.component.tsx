import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { TimePickerInput } from '../task-event/TimePickerInput.component';
import styles from './TaskDatePicker.module.css';

interface TaskDatePickerProps {
  selectedDate?: Date;
  selectedTime?: Date;
  onDateSelect?: (date: Date) => void;
  onTimeSelect?: (time: string) => void;
  onRemove?: () => void;
  label?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export const TaskDatePicker: React.FC<TaskDatePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onRemove,
  label = 'Set deadline',
  isOpen = false,
  onToggle
}) => {
  const { t } = useAppTranslate('task');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const formatDate = (dateInput: Date) => {
    return dateInput.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeToHHmm = (dateInput: Date) => {
    const hours = dateInput.getHours().toString().padStart(2, '0');
    const minutes = dateInput.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleToggle = () => {
    const newState = !isOpen;
    if (onToggle) {
      onToggle(newState);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    if (!showDatePicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (calendarRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setShowDatePicker(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  // Calculate calendar position when it opens and update root styles
  useEffect(() => {
    if (!showDatePicker || !triggerRef.current) return;

    const calculatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const calendarWidth = 288; // w-72 = 18rem = 288px
      const calendarHeight = 360; // approximate height

      let top = triggerRect.bottom + 8;
      let left = triggerRect.left;

      // Check if calendar goes off screen to the right
      if (left + calendarWidth > window.innerWidth) {
        left = window.innerWidth - calendarWidth - 8;
      }

      // Check if calendar goes off screen at the bottom
      if (top + calendarHeight > window.innerHeight) {
        top = triggerRect.top - calendarHeight - 8;
      }

      setCalendarPosition({ top, left });
      
      // Set CSS custom properties on document root
      document.documentElement.style.setProperty('--calendar-top', `${top}px`);
      document.documentElement.style.setProperty('--calendar-left', `${left}px`);
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [showDatePicker]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, 0 - (startingDayOfWeek - 1 - i));
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    // Chỉ cấm những ngày TRƯỚC hôm nay (không bao gồm hôm nay)
    return checkDate.getTime() < today.getTime();
  };

  const days = getDaysInMonth(currentMonth);

  if (!isOpen && !selectedDate) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-600 hover:bg-gray-50 transition-colors rounded-lg border border-gray-100"
      >
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header with action buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>

        <div className="flex items-center gap-1">
          {selectedDate && (
            <button
              type="button"
              onClick={() => onRemove?.()}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={t('remove_deadline')}
              aria-label={t('remove_deadline')}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => onToggle?.(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={t('close')}
            aria-label={t('close')}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Date and Time Row */}
      <div className="flex gap-2 items-start">
        {/* Date Picker Button and Calendar */}
        <div className="relative flex-1">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs sm:text-sm border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-left bg-blue-50 font-medium"
          >
            <svg
              className="w-4 h-4 text-blue-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-blue-700 font-medium truncate">
              {selectedDate ? formatDate(selectedDate) : 'Date'}
            </span>
          </button>

          {showDatePicker &&
            createPortal(
              <div
                ref={calendarRef}
                className={styles.calendarPortal}
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    title={t('prev_month')}
                    aria-label={t('prev_month')}
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <h3 className="text-sm font-medium text-gray-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>

                  <button
                    type="button"
                    title={t('next_month')}
                    aria-label={t('next_month')}
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day, index) => (
                  <div key={index} className="text-xs font-medium text-gray-500 text-center py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const disabled = isPastDate(day.date);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (disabled) return;
                        if (onDateSelect) {
                          // Preserve time when changing date
                          if (selectedTime instanceof Date) {
                            day.date.setHours(
                              selectedTime.getHours(),
                              selectedTime.getMinutes(),
                              0,
                              0
                            );
                          }
                          onDateSelect(day.date);
                        }
                        setShowDatePicker(false);
                      }}
                      disabled={disabled}
                      className={`
                        h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors
                        ${
                          disabled
                            ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                            : day.isCurrentMonth
                            ? 'text-gray-900 hover:bg-blue-50 cursor-pointer'
                            : 'text-gray-400 hover:bg-gray-50 cursor-pointer'
                        }
                        ${
                          isSelected(day.date) && !disabled
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : ''
                        }
                        ${
                          isToday(day.date) && !isSelected(day.date) && !disabled
                            ? 'bg-blue-100 text-blue-600 font-medium'
                            : ''
                        }
                      `}
                      title={disabled ? 'Cannot select past dates' : ''}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>
              </div>,
              document.body
            )}
        </div>

        {/* Time Picker Input */}
        <div className="flex-1">
          <TimePickerInput
            selectedTime={selectedTime ? formatTimeToHHmm(selectedTime) : ''}
            onTimeSelect={onTimeSelect}
            placeholder="HH:mm"
            format24h={true}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
