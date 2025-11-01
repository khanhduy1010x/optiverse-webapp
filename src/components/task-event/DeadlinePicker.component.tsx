import React, { useState } from 'react';
import { CalendarDatePicker } from './CalendarDatePicker.component';
import { TimePickerInput } from './TimePickerInput.component';

interface DeadlinePickerProps {
  selectedDate?: string | Date;
  selectedTime?: string | Date;
  onDateSelect?: (date: Date) => void;
  onTimeSelect?: (time: string) => void;
  onRemove?: () => void;
  label?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export const DeadlinePicker: React.FC<DeadlinePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onRemove,
  label = 'Add deadline',
  isOpen = false,
  onToggle
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeToHHmm = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleToggle = () => {
    const newState = !isOpen;
    if (onToggle) {
      onToggle(newState);
    }
  };

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
          {/* Close button - just close the picker */}
          <button
            type="button"
            onClick={() => onToggle?.(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Close deadline picker"
            aria-label="Close deadline picker"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Date and Time Row */}
      <div className="flex gap-2 items-start">
        {/* Date Picker Button */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-left bg-gray-50"
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
            <span className="text-gray-700 font-medium truncate">
              {selectedDate ? formatDate(selectedDate) : 'Date'}
            </span>
          </button>

          {showDatePicker && (
            <div className="absolute top-full left-0 mt-1 z-50">
              <CalendarDatePicker
                selectedDate={selectedDate ? new Date(selectedDate) : new Date()}
                onDateSelect={(date) => {
                  if (onDateSelect) {
                    // Preserve time when changing date
                    if (selectedTime instanceof Date) {
                      date.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
                    }
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
