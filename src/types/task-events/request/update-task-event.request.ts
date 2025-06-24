import { RepeatType } from '../task-events.types';

export interface UpdateTaskEventRequest {
  title?: string;
  description?: string;
  start_time?: Date | string;
  end_time?: Date | string;
  task_id?: string;
  repeat_type?: RepeatType;
  all_day?: boolean;
  location?: string;
  repeat_interval?: number;
  repeat_end_date?: Date | string;
} 