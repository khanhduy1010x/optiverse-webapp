import React, { useState, useRef, useEffect } from 'react';
import { CalendarDatePicker } from './CalendarDatePicker.component';
import { TimePickerDropdown } from './TimePickerDropdown.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface DateTimePickerProps {
  selectedDateTime?: Date;
  onDateTimeSelected: (dateTime: Date) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDateTime,
  onDateTimeSelected,
  placeholder,
  className = '',
  label
}) => {
  const { t } = useAppTranslate('task');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display (12-hour format)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Convert 12-hour format time string to 24-hour format for Date object
  const parseTimeString = (timeString: string) => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return { hours: hour24, minutes };
  };

  const handleDateSelected = (date: Date) => {
    const newDateTime = new Date(date);
    
    // Preserve existing time if available
    if (selectedDateTime) {
      newDateTime.setHours(selectedDateTime.getHours(), selectedDateTime.getMinutes());
    } else {
      newDateTime.setHours(9, 0); // Default to 9:00 AM
    }
    
    onDateTimeSelected(newDateTime);
    setIsCalendarOpen(false);
  };

  const handleTimeSelected = (timeString: string) => {
    const { hours, minutes } = parseTimeString(timeString);
    const newDateTime = selectedDateTime ? new Date(selectedDateTime) : new Date();
    
    newDateTime.setHours(hours, minutes, 0, 0);
    onDateTimeSelected(newDateTime);
    setIsTimeDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      if (timeRef.current && !timeRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 block">{label}</label>
      )}
      
      <div className="flex items-center gap-2">
        {/* Date Picker */}
        <div className="relative flex-1" ref={calendarRef}>
          <button
            onClick={() => {
              setIsCalendarOpen(!isCalendarOpen);
              setIsTimeDropdownOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={selectedDateTime ? 'text-gray-900' : 'text-gray-500'}>
                {selectedDateTime ? formatDate(selectedDateTime) : (placeholder || t('select_date'))}
              </span>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isCalendarOpen && (
            <div className="absolute top-full left-0 mt-1 z-50">
              <CalendarDatePicker
            selectedDate={selectedDateTime}
            onDateSelected={handleDateSelected}
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
          />
            </div>
          )}
        </div>

        {/* Time Picker */}
        <div className="relative flex-1" ref={timeRef}>
          <button
            onClick={() => {
              setIsTimeDropdownOpen(!isTimeDropdownOpen);
              setIsCalendarOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={selectedDateTime ? 'text-gray-900' : 'text-gray-500'}>
                {selectedDateTime ? formatTime(selectedDateTime) : t('select_time')}
              </span>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <TimePickerDropdown
            selectedTime={selectedDateTime ? formatTime(selectedDateTime) : ''}
            onTimeSelected={handleTimeSelected}
            isOpen={isTimeDropdownOpen}
            onClose={() => setIsTimeDropdownOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};