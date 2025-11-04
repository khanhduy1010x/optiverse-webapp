import React, { useState, useRef, useEffect } from 'react';
import { useOutsideClick } from '../../hooks/common/useOutsideClick.hook';

interface TimePickerInputProps {
  selectedTime?: string; // Can be "HH:mm" (24h) or "H:mm AM/PM" (12h display)
  onTimeSelect?: (time: string) => void;
  className?: string;
  format24h?: boolean; // If true, input/output in 24h format; if false, 12h format
  placeholder?: string;
  label?: string;
  startTime?: string; // For calculating end time duration
  isEndTime?: boolean; // To highlight default 1-hour duration
}

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  selectedTime,
  onTimeSelect,
  className = '',
  format24h = true,
  placeholder = 'HH:mm',
  label = '',
  startTime,
  isEndTime = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredTimes, setFilteredTimes] = useState<string[]>([]);
  const [inputError, setInputError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Generate time options for dropdown (every 15 minutes in 24-hour format)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time24h = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(time24h);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Convert 24h to 12h format for display
  const convertFrom24hDisplay = (time24h: string): string => {
    const [hours, minutes] = time24h.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Convert 12h display to 24h format
  const convertTo24hFromDisplay = (display: string): string => {
    const match = display.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return '';

    let [, hours, minutes, period] = match;
    let hour = parseInt(hours, 10);
    const min = parseInt(minutes, 10);

    if (period.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  };

  // Validate time input format (24h)
  const validateTimeInput = (value: string): boolean => {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(value);
  };

  // Normalize time to 24h format for internal use
  const normalizeTime = (time: string): string => {
    // If already in 24h format (HH:mm or H:mm)
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [h, m] = time.split(':');
      return `${h.padStart(2, '0')}:${m}`;
    }
    // If in 12h format, convert to 24h
    if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(time)) {
      return convertTo24hFromDisplay(time);
    }
    return time;
  };

  // Filter times based on input
  const handleInputChange = (value: string) => {
    setInputValue(value);
    setInputError('');

    if (!value) {
      setFilteredTimes(timeOptions);
      // Allow clearing the input
      if (onTimeSelect) {
        onTimeSelect(''); // Notify parent that time is cleared
      }
      return;
    }

    // Try to parse input as time
    const normalized = normalizeTime(value);

    // Filter times that match the input
    const filtered = timeOptions.filter((time) => {
      // Match by exact or partial input
      return time.includes(normalized) || 
             convertFrom24hDisplay(time).toLowerCase().includes(value.toLowerCase());
    });

    setFilteredTimes(filtered);

    // Validate if complete time was entered
    if (value.length >= 5 && !validateTimeInput(normalized)) {
      setInputError('Invalid time format. Use HH:mm (00:00 to 23:59)');
    }
  };

  // Handle time selection
  const handleTimeSelect = (time24h: string) => {
    const outputTime = format24h ? time24h : convertFrom24hDisplay(time24h);
    if (onTimeSelect) {
      onTimeSelect(outputTime);
    }
    setInputValue('');
    setFilteredTimes(timeOptions);
    setIsOpen(false);
    setInputError('');
  };

  // Handle direct input submission (for user typing and pressing Enter)
  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!inputValue) {
        setInputError('Please enter a time');
        return;
      }

      const normalized = normalizeTime(inputValue);
      if (!validateTimeInput(normalized)) {
        setInputError('Invalid time format. Use HH:mm (00:00 to 23:59)');
        return;
      }

      handleTimeSelect(normalized);
    } else if (e.key === 'Escape') {
      setInputValue('');
      setFilteredTimes(timeOptions);
      setIsOpen(false);
      setInputError('');
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    if (inputValue && !inputError) {
      const normalized = normalizeTime(inputValue);
      if (validateTimeInput(normalized)) {
        handleTimeSelect(normalized);
      }
    } else if (!inputValue) {
      // User cleared the input - allow empty value
      setInputValue('');
      setFilteredTimes(timeOptions);
      setInputError('');
      if (onTimeSelect) {
        onTimeSelect(''); // Pass empty value to parent
      }
    }
  };

  // Calculate duration between start and end time
  const calculateDuration = (start: string, end: string): string => {
    try {
      const startNorm = normalizeTime(start);
      const endNorm = normalizeTime(end);

      const [startH, startM] = startNorm.split(':').map(Number);
      const [endH, endM] = endNorm.split(':').map(Number);

      let startMinutes = startH * 60 + startM;
      let endMinutes = endH * 60 + endM;

      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60; // Next day
      }

      const diffMinutes = endMinutes - startMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;

      if (hours === 0) return `${mins} mins`;
      if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
      return `${hours}h ${mins}m`;
    } catch {
      return '';
    }
  };

  // Highlight duration for end time
  const isDefaultDuration =
    isEndTime && startTime && selectedTime
      ? calculateDuration(startTime, selectedTime) === '1 hr'
      : false;

  const displayValue = selectedTime
    ? format24h
      ? selectedTime
      : convertFrom24hDisplay(normalizeTime(selectedTime))
    : '';

  useOutsideClick<HTMLDivElement>(
    () => {
      setIsOpen(false);
      setInputValue('');
      setFilteredTimes(timeOptions);
      setInputError('');
    },
    isOpen
  );

  // Close dropdown when clicking outside (including fixed dropdown)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking inside container or dropdown
      if (containerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return;
      }

      // Close dropdown
      setIsOpen(false);
      setInputValue('');
      setFilteredTimes(timeOptions);
      setInputError('');
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, timeOptions]);

  // Calculate dropdown position when isOpen changes
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  if (!containerRef.current) {
    // This is to ensure the ref is attached
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue || displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleInputSubmit}
          onBlur={handleInputBlur}
          onFocus={() => {
            setIsOpen(true);
            if (!inputValue) {
              setFilteredTimes(timeOptions);
            }
          }}
          placeholder={placeholder}
          className={`w-full px-3 py-2 text-sm border rounded-md font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            inputError
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-blue-500'
          } ${isDefaultDuration ? 'bg-blue-50 border-blue-300' : ''}`}
          maxLength={8}
        />

        {/* Clock Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* Error message */}
      {inputError && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {inputError}
        </p>
      )}

      {/* Duration hint for end time */}
      {isEndTime && startTime && selectedTime && (
        <p className="mt-1 text-xs text-gray-500">
          Duration: {calculateDuration(startTime, selectedTime)}
        </p>
      )}

      {/* Dropdown - Fixed positioning to escape modal overflow */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto z-[9999]"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
          }}
        >
          {filteredTimes.length > 0 ? (
            filteredTimes.map((time24h) => {
              const display12h = convertFrom24hDisplay(time24h);
              const isSelected = displayValue === (format24h ? time24h : display12h);
              const isDefaultDur =
                isEndTime && startTime
                  ? calculateDuration(startTime, time24h) === '1 hr'
                  : false;

              return (
                <button
                  key={time24h}
                  type="button"
                  onClick={() => handleTimeSelect(time24h)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0 ${
                    isSelected ? 'bg-blue-100 text-blue-700 font-medium' : ''
                  } ${isDefaultDur && !isSelected ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="font-mono">{time24h}</span>
                      <span className="text-gray-500 ml-2">({display12h})</span>
                    </span>
                    {isDefaultDur && !isSelected && (
                      <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded">
                        1 hr
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No times found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
