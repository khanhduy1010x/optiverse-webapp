import { RepeatType, RepeatEndType, RepeatUnit } from '../task-events.types';

export interface UpdateTaskEventRequest {
  title?: string;
  start_time?: Date | string;
  end_time?: Date | string;
  all_day?: boolean;
  repeat_type?: RepeatType;
  repeat_interval?: number;
  repeat_frequency?: number;
  repeat_unit?: RepeatUnit;
  repeat_days?: number[];
  repeat_end_type?: RepeatEndType;
  repeat_end_date?: Date | string;
  repeat_occurrences?: number;
  exclusion_dates?: (Date | string)[]; // Dates to exclude from recurring series
  location?: string;
  description?: string;
  guests?: string[];
  parent_event_id?: string; // ID của sự kiện gốc (nếu đây là sự kiện lặp lại)
  color?: string; // Event color (hex code)
}