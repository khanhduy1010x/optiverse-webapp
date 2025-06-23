import { RepeatType, RepeatEndType } from '../task-events.types';

export interface UpdateTaskEventRequest {
  title?: string;
  start_time?: Date;
  end_time?: Date;
  all_day?: boolean;
  repeat_type?: RepeatType;
  repeat_interval?: number;
  repeat_days?: number[];
  repeat_end_type?: RepeatEndType;
  repeat_end_date?: Date;
  repeat_occurrences?: number;
  location?: string;
  description?: string;
  guests?: string[];
} 