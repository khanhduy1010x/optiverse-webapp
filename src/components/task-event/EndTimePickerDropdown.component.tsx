import React from 'react';

interface EndTimeOption {
  time: string;
  label: string;
}

interface EndTimePickerDropdownProps {
  isOpen: boolean;
  selectedTime: string;
  startTime: string;
  onTimeSelected: (time: string) => void;
  className?: string;
}

export const EndTimePickerDropdown: React.FC<EndTimePickerDropdownProps> = ({
  isOpen,
  selectedTime,
  startTime,
  onTimeSelected,
  className = ''
}) => {
  // Generate time options for dropdown (0:00am to 11:45pm with 15-minute intervals)
  const timeOptions = [
    '0:00am', '0:15am', '0:30am', '0:45am',
    '1:00am', '1:15am', '1:30am', '1:45am',
    '2:00am', '2:15am', '2:30am', '2:45am',
    '3:00am', '3:15am', '3:30am', '3:45am',
    '4:00am', '4:15am', '4:30am', '4:45am',
    '5:00am', '5:15am', '5:30am', '5:45am',
    '6:00am', '6:15am', '6:30am', '6:45am',
    '7:00am', '7:15am', '7:30am', '7:45am',
    '8:00am', '8:15am', '8:30am', '8:45am',
    '9:00am', '9:15am', '9:30am', '9:45am',
    '10:00am', '10:15am', '10:30am', '10:45am',
    '11:00am', '11:15am', '11:30am', '11:45am',
    '0:00pm', '0:15pm', '0:30pm', '0:45pm',
    '1:00pm', '1:15pm', '1:30pm', '1:45pm',
    '2:00pm', '2:15pm', '2:30pm', '2:45pm',
    '3:00pm', '3:15pm', '3:30pm', '3:45pm',
    '4:00pm', '4:15pm', '4:30pm', '4:45pm',
    '5:00pm', '5:15pm', '5:30pm', '5:45pm',
    '6:00pm', '6:15pm', '6:30pm', '6:45pm',
    '7:00pm', '7:15pm', '7:30pm', '7:45pm',
    '8:00pm', '8:15pm', '8:30pm', '8:45pm',
    '9:00pm', '9:15pm', '9:30pm', '9:45pm',
    '10:00pm', '10:15pm', '10:30pm', '10:45pm',
    '11:00pm', '11:15pm', '11:30pm', '11:45pm',
  ];

  // Get end time options based on start time
  const getEndTimeOptions = (): EndTimeOption[] => {
    const startTimeIndex = timeOptions.findIndex(time => time.toLowerCase() === startTime.toLowerCase());
    if (startTimeIndex === -1) return [];
    
    // Only show times after the start time
    const availableTimes = timeOptions.slice(startTimeIndex + 1);
    
    // Create options with duration
    return availableTimes.map((time) => ({
      time,
      label: `${time} (${getTimeDuration(startTime, time)})`
    }));
  };

  // Calculate duration between two time strings
  const getTimeDuration = (startTime: string, endTime: string): string => {
    // Convert to Date objects to calculate
    const today = new Date();
    const start = parseTimeString12h(startTime);
    const end = parseTimeString12h(endTime);
    
    const startDate = new Date(today);
    startDate.setHours(start[0], start[1], 0, 0);
    
    const endDate = new Date(today);
    endDate.setHours(end[0], end[1], 0, 0);
    
    // If end time is earlier than start time, assume it's the next day
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    // Calculate difference in minutes
    const diffMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (60 * 1000));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} mins`;
    } else if (diffMinutes === 60) {
      return '1 hr';
    } else if (diffMinutes % 60 === 0) {
      return `${diffMinutes / 60} hrs`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      if (mins === 30 && hours === 1) {
        return '1.5 hrs';
      } else if (mins === 30) {
        return `${hours}.5 hrs`;
      } else {
        return `${hours} hr ${mins} mins`;
      }
    }
  };

  // Parse 12-hour time string to [hours, minutes] in 24-hour format
  const parseTimeString12h = (timeStr: string): [number, number] => {
    const isPM = timeStr.toLowerCase().includes('pm');
    const timeParts = timeStr.toLowerCase().replace('am', '').replace('pm', '').split(':');
    
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    // Special handling for 0:XX format
    if (hours === 0) {
      hours = isPM ? 12 : 0;
    } else if (isPM && hours < 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }
    
    return [hours, minutes];
  };

  if (!isOpen) return null;

  const endTimeOptions = getEndTimeOptions();

  return (
    <div className={`absolute z-50 mt-1 w-56 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg ${className}`}>
      {endTimeOptions.map((option) => {
        const isOneHour = option.label.includes('1 hr') && !option.label.includes('1.5') && !option.label.includes('11');
        return (
          <div 
            key={option.time} 
            className={`p-2.5 text-sm hover:bg-gray-100 cursor-pointer
              ${selectedTime === option.time ? 'bg-blue-100' : ''}
              ${isOneHour ? 'bg-blue-50' : ''}`}
            onClick={() => onTimeSelected(option.time)}
          >
            {option.label}
          </div>
        );
      })}
    </div>
  );
}; 