import React, { useState } from 'react';
import { TimePickerInput } from './TimePickerInput.component';
import { CalendarDatePicker } from './CalendarDatePicker.component';

interface DateTimePickerInputProps {
  selectedDate?: string | Date;
  selectedTime?: string | Date;
  onDateSelect?: (date: Date) => void;
  onTimeSelect?: (time: string) => void;
  placeholder?: string;
  label?: string;
  startTime?: string;
  isEndTime?: boolean;
  className?: string;
}

export const DateTimePickerInput: React.FC<DateTimePickerInputProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  placeholder = 'HH:mm',
  label = '',
  startTime,
  isEndTime = false,
  className = ''
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeToHHmm = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-xs font-medium text-gray-600">{label}</label>}

      <div className="flex gap-2">
        {/* Date Picker */}
        <div className="flex-1 relative">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-left"
          >
            <svg
              className="w-4 h-4 text-gray-400 flex-shrink-0"
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
            <span className="text-gray-700 text-xs">
              {selectedDate ? formatDate(selectedDate) : 'Date'}
            </span>
          </button>

          {showDatePicker && (
            <div className="absolute top-full left-0 mt-1 z-50">
              <CalendarDatePicker
                selectedDate={selectedDate ? new Date(selectedDate) : new Date()}
                onDateSelect={(date) => {
                  if (onDateSelect) {
                    onDateSelect(date);
                  }
                  setShowDatePicker(false);
                }}
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
              />
            </div>
          )}
        </div>

        {/* Time Picker */}
        <div className="flex-1">
          <TimePickerInput
            selectedTime={selectedTime ? formatTimeToHHmm(selectedTime) : ''}
            onTimeSelect={onTimeSelect}
            placeholder={placeholder}
            format24h={true}
            startTime={startTime}
            isEndTime={isEndTime}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
