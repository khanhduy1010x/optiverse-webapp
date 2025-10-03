export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekday' | 'custom';
export type RepeatEndType = 'never' | 'on' | 'after';
export type RepeatUnit = 'day' | 'week' | 'month' | 'year';

export interface TaskEvent {
  _id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: Date | string;
  end_time?: Date | string;
  all_day?: boolean;
  repeat_type: RepeatType;
  repeat_interval?: number;
  repeat_frequency?: number; // Frequency of repetition
  repeat_unit?: RepeatUnit; // Unit for custom repetition (day, week, month, year)
  repeat_days?: number[]; // 0-6 for Sunday-Saturday
  repeat_end_type?: RepeatEndType;
  repeat_end_date?: Date | string;
  repeat_occurrences?: number;
  exclusion_dates?: (Date | string)[]; // Dates to exclude from recurring series
  location?: string;
  guests?: string[];
  color?: string; // Event color (hex code)
  createdAt?: Date;
  updatedAt?: Date;
  isRecurrence?: boolean; // Flag to identify generated recurring events
  parent_event_id?: string; // ID của sự kiện gốc (nếu đây là sự kiện lặp lại)
  
  // Layout properties for calendar display
  top?: number;
  height?: number;
  left?: number;
  width?: number;
  column?: number;
  totalColumns?: number;
}