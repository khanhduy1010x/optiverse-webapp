export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekday' | 'custom';
export type RepeatEndType = 'never' | 'on' | 'after';

export interface TaskEvent {
  _id: string;
  task_id?: string;
  title: string;
  description?: string;
  start_time: Date | string;
  end_time?: Date | string;
  all_day?: boolean;
  repeat_type: RepeatType;
  repeat_interval?: number;
  repeat_days?: number[]; // 0-6 for Sunday-Saturday
  repeat_end_type?: RepeatEndType;
  repeat_end_date?: Date | string;
  repeat_occurrences?: number;
  location?: string;
  guests?: string[];
  createdAt?: Date;
  updatedAt?: Date;
} 