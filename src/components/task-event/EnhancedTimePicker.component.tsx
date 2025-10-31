import React, { useState, useRef, useEffect } from 'react';
import { useOutsideClick } from '../../hooks/common/useOutsideClick.hook';

interface EnhancedTimePickerProps {
  selectedTime?: string; // Can be "HH:mm" (24h) or "H:mm AM/PM" (12h display)
  onTimeSelect?: (time: string) => void; // New API (24h format)
  onTimeSelected?: (time: string) => void; // Old API (backward compatibility)
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  label?: string;
  format24h?: boolean; // If true, input/output in 24h format; if false, 12h format
}

export const EnhancedTimePicker: React.FC<EnhancedTimePickerProps> = ({
  selectedTime,
  onTimeSelect,
  onTimeSelected,
  className = '',
  isOpen = true,
  onClose,
  label = '',
  format24h = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [activeTab, setActiveTab] = useState<'select' | 'input'>('select');
  const inputRef = useRef<HTMLInputElement>(null);

  // Use onTimeSelect as primary callback, fallback to onTimeSelected
  const handleTimeCallback = onTimeSelect || onTimeSelected;

  // Normalize time to 24h format for internal use
  const normalizeTime = (time: string): string => {
    // If already in 24h format (HH:mm or H:mm), return as is
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [h, m] = time.split(':');
      return `${h.padStart(2, '0')}:${m}`;
    }
    // If in 12h format, convert to 24h
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      let [, hours, minutes, period] = match;
      let hour = parseInt(hours, 10);
      const min = parseInt(minutes, 10);
      
      if (period.toUpperCase() === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    }
    return time;
  };

  const convertFrom24hDisplay = (time24h: string): string => {
    // Convert 24-hour format to 12-hour for display
    const [hours, minutes] = time24h.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const convertTo24hFromDisplay = (display: string): string => {
    // Convert 12-hour display format to 24-hour
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

  // Validate time input format (24h)
  const validateTimeInput = (value: string): boolean => {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(value);
  };

  // Handle manual input
  const handleInputChange = (value: string) => {
    setInputValue(value);
    setInputError('');

    // Validate on blur
    if (value && !validateTimeInput(value)) {
      setInputError('Please use HH:mm format (00:00 to 23:59)');
    }
  };

  const handleInputSubmit = () => {
    if (!inputValue) {
      setInputError('Please enter a time');
      return;
    }

    if (!validateTimeInput(inputValue)) {
      setInputError('Please use HH:mm format (00:00 to 23:59)');
      return;
    }

    // Output format based on format24h prop
    const outputTime = format24h ? inputValue : convertFrom24hDisplay(inputValue);
    if (handleTimeCallback) {
      handleTimeCallback(outputTime);
    }
    setInputValue('');
    setInputError('');
    if (onClose) {
      onClose();
    }
  };

  // Handle dropdown selection
  const handleTimeSelect = (time24h: string) => {
    // Output format based on format24h prop
    const outputTime = format24h ? time24h : convertFrom24hDisplay(time24h);
    if (handleTimeCallback) {
      handleTimeCallback(outputTime);
    }
    setInputValue('');
    setInputError('');
    if (onClose) {
      onClose();
    }
  };

  // Update input value when selectedTime changes
  useEffect(() => {
    if (selectedTime) {
      setInputValue('');
    }
  }, [selectedTime]);

  // Handle keyboard events
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setInputValue('');
      setInputError('');
      if (onClose) {
        onClose();
      }
    }
  };

  const dropdownRef = useOutsideClick<HTMLDivElement>(() => {
    if (onClose) {
      onClose();
    }
  }, isOpen);

  if (!isOpen) {
    return null;
  }

  // Normalize selected time for comparison
  const normalizedSelected = selectedTime ? normalizeTime(selectedTime) : '';

  return (
    <div
      ref={dropdownRef}
      className={`absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg ${className}`}
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('select')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'select'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Select
        </button>
        <button
          onClick={() => setActiveTab('input')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'input'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Input
        </button>
      </div>

      {/* Content */}
      {activeTab === 'select' ? (
        <div className="max-h-60 overflow-y-auto">
          {timeOptions.map((time24h) => (
            <button
              key={time24h}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors ${
                normalizedSelected === time24h
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700'
              }`}
              onClick={() => handleTimeSelect(time24h)}
              title={time24h}
            >
              <span className="font-mono">{time24h}</span>
              <span className="text-gray-500 ml-2">({convertFrom24hDisplay(time24h)})</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter time (24-hour format)
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="HH:mm (e.g., 14:30)"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className={`w-full px-3 py-2 border rounded-md text-sm font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                inputError
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              maxLength={5}
              autoFocus
            />
            {inputError && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {inputError}
              </p>
            )}
          </div>

          {inputValue && !inputError && (
            <div className="bg-blue-50 p-2 rounded text-sm">
              <p className="text-gray-700">
                <span className="font-medium">24h:</span> <span className="font-mono">{inputValue}</span>
              </p>
              <p className="text-gray-700">
                <span className="font-medium">12h:</span> <span className="font-mono">{convertFrom24hDisplay(inputValue)}</span>
              </p>
            </div>
          )}

          <button
            onClick={handleInputSubmit}
            disabled={!inputValue || !!inputError}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Confirm Time
          </button>
        </div>
      )}
    </div>
  );
};
