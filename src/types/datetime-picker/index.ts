export interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  onCancel?: () => void;
  onConfirm?: (date: Date) => void;
  onClear?: () => void;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  onClear?: () => void;
  minDate?: Date;
  maxDate?: Date;
  currentMonth?: Date;
  onMonthChange?: (month: Date) => void;
  className?: string;
}

export interface TimePickerProps {
  selectedTime?: Date;
  onTimeSelect: (time: Date) => void;
  format?: '12h' | '24h';
  minuteStep?: number;
  className?: string;
}

export interface DateTimeDisplayProps {
  selectedDate?: Date;
  selectedTime?: Date;
  format?: string;
  timeFormat?: '12h' | '24h';
  className?: string;
}

export interface DateTimePickerState {
  selectedDate: Date | null;
  selectedTime: Date | null;
  currentMonth: Date;
  isCalendarOpen: boolean;
  isTimePickerOpen: boolean;
  tempDate: Date | null;
  tempTime: Date | null;
}

export interface DateTimePickerActions {
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: Date | null) => void;
  setCurrentMonth: (month: Date) => void;
  setIsCalendarOpen: (isOpen: boolean) => void;
  setIsTimePickerOpen: (isOpen: boolean) => void;
  setTempDate: (date: Date | null) => void;
  setTempTime: (time: Date | null) => void;
  resetTemp: () => void;
  confirmSelection: () => void;
  cancelSelection: () => void;
}

export type TimeFormat = '12h' | '24h';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

export interface TimeOption {
  value: string;
  label: string;
  hour: number;
  minute: number;
  period?: 'AM' | 'PM';
}