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
  searchQuery?: string; // Search/filter query from parent input
}

export const EnhancedTimePicker: React.FC<EnhancedTimePickerProps> = ({
  selectedTime,
  onTimeSelect,
  onTimeSelected,
  className = '',
  isOpen = true,
  onClose,
  label = '',
  format24h = true,
  searchQuery = ''
}) => {
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

  // Filter time options based on search query
  const filteredTimeOptions = searchQuery
    ? timeOptions.filter((time24h) => {
        const time12h = convertFrom24hDisplay(time24h);
        const query = searchQuery.toLowerCase();
        return (
          time24h.includes(query) ||
          time12h.toLowerCase().includes(query)
        );
      })
    : timeOptions;

  // Handle dropdown selection
  const handleTimeSelect = (time24h: string) => {
    // Output format based on format24h prop
    const outputTime = format24h ? time24h : convertFrom24hDisplay(time24h);
    if (handleTimeCallback) {
      handleTimeCallback(outputTime);
    }
    if (onClose) {
      onClose();
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
      {/* Time List */}
      <div className="max-h-60 overflow-y-auto">
        {filteredTimeOptions.length > 0 ? (
          filteredTimeOptions.map((time24h) => (
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
          ))
        ) : (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            No times found
          </div>
        )}
      </div>
    </div>
  );
};
