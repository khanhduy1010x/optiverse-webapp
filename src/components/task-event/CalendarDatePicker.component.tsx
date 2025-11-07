import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import styles from './CalendarDatePicker.module.css';

interface CalendarDatePickerProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | HTMLElement | null>;
}

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  selectedDate,
  onDateSelect,
  className = '',
  isOpen = true,
  onClose,
  triggerRef: externalTriggerRef
}) => {
  const { t } = useAppTranslate('common');
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
  }, [isOpen, onClose]);

  // Calculate calendar position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const calculatePosition = () => {
        const rect = triggerRef.current!.getBoundingClientRect();
        const calendarWidth = 288; // w-72 = 18rem = 288px
        const calendarHeight = 360; // approximate height

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
  }, [isOpen]);

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
    const remainingCells = 42 - days.length; // 6 rows × 7 days = 42 cells
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

  return createPortal(
    <div
      ref={calendarRef}
      className={styles.calendarPortal}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          title="Previous month"
          aria-label="Previous month"
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
          title="Next month"
          aria-label="Next month"
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
                if (!disabled) {
                  onDateSelect(day.date);
                  onClose?.();
                }
              }}
              disabled={disabled}
              className={`
                h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors
                ${disabled
                  ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                  : day.isCurrentMonth 
                  ? 'text-gray-900 hover:bg-blue-50 cursor-pointer' 
                  : 'text-gray-400 hover:bg-gray-50 cursor-pointer'
                }
                ${isSelected(day.date) && !disabled
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : ''
                }
                ${isToday(day.date) && !isSelected(day.date) && !disabled
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
  );
};