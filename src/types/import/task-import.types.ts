export type ImportPriority = 'low' | 'medium' | 'high';
export type ImportStatus = 'pending' | 'completed' | 'overdue';
export type ImportRepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type ImportRepeatUnit = 'day' | 'week' | 'month' | 'year';
export type ImportRepeatEndType = 'never' | 'on_date' | 'after_occurrences';

// Expected columns in the Excel template
export interface TaskImportRow {
  title: string;
  description?: string;
  priority?: string | ImportPriority; // allow free text, we'll normalize
  status?: string | ImportStatus; // allow free text, we'll normalize

  // Accept both combined datetime (Task template) and split date/time (Event template)
  start_time?: string | number; // "dd/mm/yyyy hh:mm" | "yyyy-mm-dd hh:mm" | Excel serial
  end_time?: string | number;   // "dd/mm/yyyy hh:mm" | "yyyy-mm-dd hh:mm" | Excel serial

  // Split date fields (Event template)
  start_date?: string | number; // "dd/mm/yyyy" | "yyyy-mm-dd" | Excel serial
  end_date?: string | number;   // kept for backward compatibility

  tags?: string; // comma-separated tag names

  // Optional TaskEvent fields (kept for backward compatibility + simplified selection)
  event_title?: string;
  all_day?: string | boolean;
  repeat?: string; // selection text: Does not repeat, daily, weekly, monthly, yearly
  repeat_type?: string | ImportRepeatType;
  repeat_interval?: string | number;
  repeat_unit?: string | ImportRepeatUnit;
  repeat_days?: string | number[]; // e.g., "1,3,5" or [1,3,5] (0-6 Sun-Sat)
  repeat_end_type?: string | ImportRepeatEndType;
  repeat_end_date?: string | number; // date string or Excel serial
  to_date?: string | number; // shortcut for repeat_end_date
  repeat_occurrences?: string | number;
  exclusion_dates?: string; // comma-separated dates
  location?: string;
  event_color?: string; // hex color (legacy)
  color?: string; // hex color
  guests?: string; // comma-separated emails
}

export interface TaskImportParseError {
  rowIndex: number; // 1-based row index excluding header
  message: string;
}

export interface TaskImportResult {
  createdCount: number;
  errors: TaskImportParseError[];
}