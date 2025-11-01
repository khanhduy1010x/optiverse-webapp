import { useState } from 'react';

interface UseTimePickerState {
  selectedTime: string | Date;
  displayValue: string;
}

export const useTimePickerInput = (initialTime?: string | Date) => {
  const [selectedTime, setSelectedTime] = useState<string | Date | undefined>(initialTime);

  // Format time to display format
  const formatTimeDisplay = (time: string | Date | undefined): string => {
    if (!time) return '';

    const dateObj = time instanceof Date ? time : new Date(`1970-01-01T${time}`);
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const resetTime = () => {
    setSelectedTime(undefined);
  };

  return {
    selectedTime,
    setSelectedTime,
    displayValue: formatTimeDisplay(selectedTime),
    handleTimeSelect,
    resetTime
  };
};
