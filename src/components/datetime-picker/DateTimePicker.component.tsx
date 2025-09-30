import React, { useEffect } from 'react';
import { DateTimePickerProps } from '../../types/datetime-picker';
import { useTheme } from '../../contexts/theme.context';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { useDateTimePicker } from '../../hooks/datetime-picker/useDateTimePicker.hook';
import Calendar from './Calendar.component';
import TimePicker from './TimePicker.component';
import { Button } from '../common/Button.component';

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  onCancel,
  onConfirm,
  onClear,
  minDate,
  maxDate,
  showTime = true,
  timeFormat = '24h',
  placeholder,
  disabled = false,
  className = '',
  isOpen = false,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t } = useAppTranslate('common');
  
  const { state, actions, combinedDateTime } = useDateTimePicker({
    initialDate: value,
    initialTime: value,
    minDate,
    maxDate,
    onChange,
  });

  // Sync external value with internal state
  useEffect(() => {
    if (value) {
      actions.setSelectedDate(value);
      actions.setSelectedTime(value);
    }
  }, [value, actions]);

  const formatDateTime = (date: Date | null) => {
    if (!date) return placeholder || t('select_date_time');
    
    const dateStr = date.toLocaleDateString();
    if (!showTime) return dateStr;
    
    const timeStr = timeFormat === '12h' 
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    return `${dateStr} ${timeStr}`;
  };

  const handleConfirm = () => {
    if (combinedDateTime) {
      onConfirm?.(combinedDateTime);
      onChange(combinedDateTime);
    }
    onClose?.();
  };

  const handleCancel = () => {
    actions.cancelSelection();
    onCancel?.();
    onClose?.();
  };

  const handleDateSelect = (date: Date) => {
    actions.setSelectedDate(date);
    if (!showTime) {
      // If time is not shown, immediately confirm the selection
      const finalDate = new Date(date);
      finalDate.setHours(0, 0, 0, 0);
      onChange(finalDate);
      onConfirm?.(finalDate);
      onClose?.();
    }
  };

  const handleTimeSelect = (time: Date) => {
    actions.setSelectedTime(time);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${className}`}
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
        }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: theme.colors.border }}
        >
          <h2 className="text-xl font-semibold">
            {showTime ? t('select_date_time') : t('select_date')}
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: theme.colors.text }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary + '20';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Selected DateTime Display */}
          <div 
            className="mb-6 p-4 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border 
            }}
          >
            <div className="text-sm font-medium mb-2" style={{ color: theme.colors.text + '80' }}>
              {t('selected')}:
            </div>
            <div className="text-lg font-semibold">
              {formatDateTime(combinedDateTime)}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar Section */}
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-4">{t('select_date')}</h3>
              <Calendar
                selectedDate={state.selectedDate}
                onDateSelect={handleDateSelect}
                onClear={onClear}
                minDate={minDate}
                maxDate={maxDate}
                currentMonth={state.currentMonth}
                onMonthChange={actions.setCurrentMonth}
                className="w-full"
              />
            </div>

            {/* Time Section */}
            {showTime && (
              <div className="flex-1 lg:max-w-xs">
                <h3 className="text-lg font-medium mb-4">{t('select_time')}</h3>
                <TimePicker
                  selectedTime={state.selectedTime}
                  onTimeSelect={handleTimeSelect}
                  format={timeFormat}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ borderColor: theme.colors.border }}
        >
          <Button
            title={t('cancel')}
            onClick={handleCancel}
            inverted
            className="px-6 py-2"
          />
          <Button
            title={t('confirm')}
            onClick={handleConfirm}
            disabled={!state.selectedDate}
            className="px-6 py-2"
          />
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker;