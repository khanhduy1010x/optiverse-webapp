import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface TimePickerDropdownProps {
  isOpen: boolean;
  selectedTime: string;
  onTimeSelected: (time: string) => void;
  className?: string;
  onClose?: () => void;
}

export const TimePickerDropdown: React.FC<TimePickerDropdownProps> = ({
  isOpen,
  selectedTime,
  onTimeSelected,
  className = '',
  onClose
}) => {
  const { t } = useAppTranslate('task');

  // Generate time options for dropdown with proper 12-hour format
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const timeString = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  if (!isOpen) return null;

  return (
    <div className={`absolute z-50 mt-1 w-32 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg ${className}`}>
      {timeOptions.map((time) => (
        <button
          key={time} 
          className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors ${
            selectedTime === time ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
          }`}
          onClick={() => onTimeSelected(time)}
        >
          {time}
        </button>
      ))}
    </div>
  );
};