import { RepeatType, RepeatEndType } from '../task-events.types';

export interface CreateTaskEventRequest {
  task_id: string;
  title?: string;
  start_time: Date | string;
  end_time?: Date | string;
  all_day?: boolean;
  repeat_type: RepeatType;
  repeat_interval?: number;
  repeat_days?: number[];
  repeat_end_type?: RepeatEndType;
  repeat_end_date?: Date | string;
  repeat_occurrences?: number;
  location?: string;
  description?: string;
  guests?: string[];
  parent_event_id?: string; // ID của sự kiện gốc (nếu đây là sự kiện lặp lại)
} 