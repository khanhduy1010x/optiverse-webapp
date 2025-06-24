export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekday';

export interface TaskEvent {
  _id: string;
  title: string;
  start_time: Date | string;
  end_time?: Date | string;
  all_day?: boolean;
  location?: string;
  repeat_type?: RepeatType;
  repeat_interval?: number;
  repeat_end_date?: Date | string;
  task_id?: string;
  description?: string;
} 