import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import styles from './WorkspaceCalendarDatePicker.module.css';

interface CalendarDatePickerProps {
  selectedDate?: Date;
  onDateSelected: (date: Date) => void;
  onClear?: () => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | HTMLElement | null>;
}

export const WorkspaceCalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  selectedDate,
  onDateSelected,
  onClear,
  className = '',
  isOpen = true,
  onClose,
  triggerRef: externalTriggerRef
}) => {
  const { t } = useAppTranslate('datetime-picker');
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const internalTriggerRef = useRef<HTMLElement | null>(null);
  const triggerRef = externalTriggerRef || internalTriggerRef;
  const [calendarPos, setCalendarPos] = useState({ top: 0, left: 0 });

  // If not open, don't render
  if (!isOpen) {
    return null;
  }

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (calendarRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      if (onClose) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  // Calculate calendar position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const calculatePosition = () => {
        const rect = triggerRef.current!.getBoundingClientRect();
        const calendarWidth = 288; // w-72 = 18rem = 288px
        const calendarHeight = 300; // approximate height

        let top = rect.bottom + 8;
        let left = rect.left;

        // Check if calendar goes off screen to the right
        if (left + calendarWidth > window.innerWidth) {
          left = window.innerWidth - calendarWidth - 8;
        }

        // Check if calendar goes off screen at the bottom
        if (top + calendarHeight > window.innerHeight) {
          top = rect.top - calendarHeight - 8;
        }

        setCalendarPos({ top, left });
        
        // Set CSS custom properties on document root
        document.documentElement.style.setProperty('--calendar-top', `${top}px`);
        document.documentElement.style.setProperty('--calendar-left', `${left}px`);
      };

      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      return () => window.removeEventListener('resize', calculatePosition);
    }
  }, [isOpen, triggerRef]);

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

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    // Only prevent dates BEFORE today (not including today)
    return checkDate.getTime() < today.getTime();
  };

  const days = getDaysInMonth(currentMonth);

  return createPortal(
    <div
      ref={calendarRef}
      className={styles.calendarPortal}
    >
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title={t('previous')}
          aria-label={t('previous')}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-sm font-semibold text-gray-800">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          type="button"
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title={t('next')}
          aria-label={t('next')}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayObj, index) => {
          const { date, isCurrentMonth } = dayObj;
          const selected = isSelectedDate(date);
          const today = isToday(date);
          const disabled = isPastDate(date);

          return (
            <button
              type="button"
              key={index}
              onClick={() => {
                if (!disabled) {
                  onDateSelected(date);
                  onClose?.();
                }
              }}
              disabled={disabled}
              className={`
                h-8 w-8 text-xs rounded-full flex items-center justify-center transition-colors
                ${disabled
                  ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                  : isCurrentMonth 
                  ? 'text-gray-900 hover:bg-blue-50 cursor-pointer' 
                  : 'text-gray-400 hover:bg-gray-50 cursor-pointer'
                }
                ${selected && !disabled
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : ''
                }
                ${today && !selected && !disabled
                  ? 'bg-blue-100 text-blue-600 font-medium'
                  : ''
                }
              `}
              title={disabled ? 'Cannot select past dates' : ''}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  );
};
