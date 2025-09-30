import React, { useMemo, useState } from 'react';
import { TimePickerProps, TimeOption } from '../../types/datetime-picker';
import { useTheme } from '../../contexts/theme.context';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const TimePicker: React.FC<TimePickerProps> = ({
  selectedTime,
  onTimeSelect,
  format = '24h',
  minuteStep = 15,
  className = '',
}) => {
  const { theme } = useTheme();
  const { t } = useAppTranslate('common');
  const [isOpen, setIsOpen] = useState(false);

  const timeOptions = useMemo(() => {
    const options: TimeOption[] = [];
    const hours = format === '12h' ? 12 : 24;
    
    for (let h = 0; h < hours; h++) {
      for (let m = 0; m < 60; m += minuteStep) {
        if (format === '12h') {
          const hour12 = h === 0 ? 12 : h;
          const period = h < 12 ? 'AM' : 'PM';
          const actualHour = h === 0 ? 0 : h > 12 ? h : h;
          
          options.push({
            value: `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`,
            label: `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`,
            hour: actualHour,
            minute: m,
            period: period as 'AM' | 'PM',
          });
        } else {
          options.push({
            value: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
            label: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
            hour: h,
            minute: m,
          });
        }
      }
    }
    
    return options;
  }, [format, minuteStep]);

  const formatSelectedTime = (time: Date | undefined) => {
    if (!time) return t('select_time');
    
    const hours = time.getHours();
    const minutes = time.getMinutes();
    
    if (format === '12h') {
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const period = hours < 12 ? 'AM' : 'PM';
      return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  };

  const handleTimeSelect = (option: TimeOption) => {
    const newTime = new Date();
    
    if (format === '12h' && option.period) {
      let hour = option.hour;
      if (option.period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (option.period === 'AM' && hour === 12) {
        hour = 0;
      }
      newTime.setHours(hour);
    } else {
      newTime.setHours(option.hour);
    }
    
    newTime.setMinutes(option.minute);
    newTime.setSeconds(0);
    newTime.setMilliseconds(0);
    
    onTimeSelect(newTime);
    setIsOpen(false);
  };

  const isSelected = (option: TimeOption) => {
    if (!selectedTime) return false;
    
    const selectedHours = selectedTime.getHours();
    const selectedMinutes = selectedTime.getMinutes();
    
    if (format === '12h' && option.period) {
      let optionHour = option.hour;
      if (option.period === 'PM' && option.hour !== 12) {
        optionHour += 12;
      } else if (option.period === 'AM' && option.hour === 12) {
        optionHour = 0;
      }
      return selectedHours === optionHour && selectedMinutes === option.minute;
    } else {
      return selectedHours === option.hour && selectedMinutes === option.minute;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Time display button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left border rounded-lg transition-all duration-200 flex items-center justify-between"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.text,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border;
        }}
      >
        <span>{formatSelectedTime(selectedTime)}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Time options dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          {timeOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleTimeSelect(option)}
              className={`
                w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150
                ${isSelected(option) ? 'font-medium' : ''}
              `}
              style={{
                backgroundColor: isSelected(option) ? theme.colors.primary + '20' : 'transparent',
                color: isSelected(option) ? theme.colors.primary : theme.colors.text,
              }}
              onMouseEnter={(e) => {
                if (!isSelected(option)) {
                  e.currentTarget.style.backgroundColor = theme.colors.primary + '10';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected(option)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TimePicker;