<<<<<<< HEAD
import { RepeatType } from '../task-events.types';

export interface CreateTaskEventRequest {
  title: string;
  description?: string;
  start_time: Date | string;
  end_time?: Date | string;
  task_id: string;
  repeat_type?: RepeatType;
  all_day?: boolean;
  location?: string;
  repeat_interval?: number;
  repeat_end_date?: Date | string;
=======
import { RepeatType, RepeatEndType } from '../task-events.types';

export interface CreateTaskEventRequest {
  task_id: string;
  title?: string;
  start_time: Date;
  end_time?: Date;
  all_day?: boolean;
  repeat_type: RepeatType;
  repeat_interval?: number;
  repeat_days?: number[];
  repeat_end_type?: RepeatEndType;
  repeat_end_date?: Date;
  repeat_occurrences?: number;
  location?: string;
  description?: string;
  guests?: string[];
>>>>>>> aa93f60831703624ecd088c309bf01770d28c29b
} 