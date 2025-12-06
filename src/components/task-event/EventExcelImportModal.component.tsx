import React, { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { useCanImport } from '../../hooks/import/useCanImport.hook';
import ImportRestrictedModal from '../import/ImportRestrictedModal.component';
import { taskEventService } from '../../services/task-event.service';
import { useAppSelector } from '../../store/hooks';
import type { CreateTaskEventRequest } from '../../types/task-events/request/create-task-event.request';
import type { RepeatEndType, RepeatType, RepeatUnit } from '../../types/task-events/task-events.types';
import type { RootState } from '../../store';

interface EventExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported?: (result: { createdCount: number; errors: { rowIndex: number; message: string }[] }) => void | Promise<void>;
}

// Helpers
const toBoolean = (val: any): boolean | undefined => {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  const s = String(val).trim().toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(s)) return true;
  if (['false', 'no', 'n', '0'].includes(s)) return false;
  return undefined;
};

const normalizeRepeatType = (v?: string): RepeatType => {
  const s = (v || '').toString().trim().toLowerCase();
  if (['daily', 'day'].includes(s)) return 'daily';
  if (['weekly', 'week'].includes(s)) return 'weekly';
  if (['monthly', 'month'].includes(s)) return 'monthly';
  if (['yearly', 'year', 'annually', 'annual'].includes(s)) return 'yearly';
  if (['weekday', 'weekdays'].includes(s)) return 'weekday';
  if (['custom'].includes(s)) return 'custom';
  return 'none';
};

const normalizeRepeatEndType = (v?: string): RepeatEndType | undefined => {
  if (!v) return undefined;
  const s = v.toString().trim().toLowerCase();
  if (['never', 'none'].includes(s)) return 'never';
  if (['on', 'until', 'date'].includes(s)) return 'on';
  if (['after', 'count'].includes(s)) return 'after';
  return undefined;
};

const normalizeRepeatUnit = (v?: string): RepeatUnit | undefined => {
  if (!v) return undefined;
  const s = v.toString().trim().toLowerCase();
  if (['day', 'd'].includes(s)) return 'day';
  if (['week', 'w'].includes(s)) return 'week';
  if (['month', 'm'].includes(s)) return 'month';
  if (['year', 'y'].includes(s)) return 'year';
  return undefined;
};

// Map human-friendly Repeat selection to RepeatType
const normalizeRepeatSelection = (v?: string): RepeatType => {
  const s = (v || '').toString().trim().toLowerCase();
  if (!s) return 'none';
  
  // Xử lý các trường hợp không lặp
  if ([
    'does not repeat', "doesn't repeat", 'doesnt repeat', 'no repeat', 'none', 'never',
    'không lặp', 'không lặp lại', 'khong lap', 'khong lap lai'
  ].includes(s)) return 'none';
  
  // Xử lý daily - thêm nhiều biến thể
  if ([
    'daily', 'day', 'everyday', 'every day', 'each day',
    'hàng ngày', 'hang ngay', 'ngày', 'ngay', 'mỗi ngày', 'moi ngay'
  ].includes(s)) return 'daily';
  
  // Xử lý weekly
  if ([
    'weekly', 'week', 'every week', 'each week',
    'hàng tuần', 'hang tuan', 'tuần', 'tuan', 'mỗi tuần', 'moi tuan'
  ].includes(s)) return 'weekly';
  
  // Xử lý monthly
  if ([
    'monthly', 'month', 'every month', 'each month',
    'hàng tháng', 'hang thang', 'tháng', 'thang', 'mỗi tháng', 'moi thang'
  ].includes(s)) return 'monthly';
  
  // Xử lý yearly
  if ([
    'yearly', 'year', 'every year', 'each year', 'annually', 'annual',
    'hàng năm', 'hang nam', 'năm', 'nam', 'mỗi năm', 'moi nam'
  ].includes(s)) return 'yearly';
  
  // Log để debug các giá trị không nhận diện được
  console.log('Unrecognized repeat value:', v, 'normalized:', s);
  return 'none';
};
const isTimeHM = (s?: string): boolean => {
  if (!s) return false;
  const st = String(s).trim();
  return /^\d{1,2}:\d{2}$/.test(st);
};

const parseDMY = (s?: string): { y: number; m: number; d: number } | undefined => {
  if (!s) return undefined;
  const st = String(s).trim();
  // dd/mm/yyyy
  const m = st.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) return { y, m: mo, d };
  }
  // yyyy-mm-dd
  const m2 = st.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m2) {
    const y = Number(m2[1]);
    const mo = Number(m2[2]);
    const d = Number(m2[3]);
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) return { y, m: mo, d };
  }
  return undefined;
};

const combineDateTimeToISO = (
  dateVal?: any,
  timeVal?: any,
  fallback?: any,
  isEnd?: boolean
): string | undefined => {
  // If date is an Excel serial number, build base date from it
  if (typeof dateVal === 'number' && isFinite(dateVal)) {
    const baseISO = parseExcelSerialToISO(dateVal);
    if (baseISO) {
      const d = new Date(baseISO);
      let h = 0;
      let mi = 0;
      if (isTimeHM(timeVal)) {
        const [hh, mm] = String(timeVal).split(':').map(Number);
        h = hh; mi = mm;
      } else if (typeof timeVal === 'number') {
        const minutes = Math.round((Number(timeVal) % 1) * 24 * 60);
        h = Math.floor(minutes / 60);
        mi = minutes % 60;
      } else if (isEnd) {
        h = 23; mi = 59;
      }
      d.setHours(h, mi, isEnd ? 59 : 0, isEnd ? 999 : 0);
      return d.toISOString();
    }
  }

  const parts = parseDMY(dateVal);
  if (parts) {
    let h = 0;
    let mi = 0;
    if (isTimeHM(timeVal)) {
      const [hh, mm] = String(timeVal).split(':').map(Number);
      h = hh; mi = mm;
    } else if (typeof timeVal === 'number') {
      // If time is given as Excel fraction, approximate by converting days to minutes
      const minutes = Math.round((Number(timeVal) % 1) * 24 * 60);
      h = Math.floor(minutes / 60);
      mi = minutes % 60;
    } else if (isEnd) {
      h = 23; mi = 59;
    }
    const dt = new Date(parts.y, parts.m - 1, parts.d, h, mi, isEnd ? 59 : 0, isEnd ? 999 : 0);
    return dt.toISOString();
  }
  // If no date parts and fallback is time-only (e.g., "09:00"), avoid creating a date from today.
  if (isTimeHM(fallback)) return undefined;
  return parseDateTimeFlexible(fallback);
};

const parseExcelSerialToISO = (val: any): string | undefined => {
  if (typeof val !== 'number' || !isFinite(val)) return undefined;
  const ms = Math.round((val - 25569) * 86400 * 1000);
  const d = new Date(ms);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

const parseDateTimeFlexible = (s?: any): string | undefined => {
  if (s === undefined || s === null || s === '') return undefined;
  if (typeof s === 'number') return parseExcelSerialToISO(s);
  const str = String(s).trim();
  if (!str) return undefined;
  // dd/mm/yyyy hh:mm
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    const h = Number(m[4]);
    const mi = Number(m[5]);
    if (d>=1 && d<=31 && mo>=1 && mo<=12 && h>=0 && h<=23 && mi>=0 && mi<=59) {
      const dt = new Date(y, mo - 1, d, h, mi, 0, 0);
      return dt.toISOString();
    }
  }
  // yyyy-mm-dd hh:mm
  const m2 = str.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})$/);
  if (m2) {
    const y = Number(m2[1]);
    const mo = Number(m2[2]);
    const d = Number(m2[3]);
    const h = Number(m2[4]);
    const mi = Number(m2[5]);
    if (d>=1 && d<=31 && mo>=1 && mo<=12 && h>=0 && h<=23 && mi>=0 && mi<=59) {
      const dt = new Date(y, mo - 1, d, h, mi, 0, 0);
      return dt.toISOString();
    }
  }
  // Fallback: native Date parsing
  const dt = new Date(str);
  return isNaN(dt.getTime()) ? undefined : dt.toISOString();
};

const parseRepeatDays = (v?: any): number[] | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  if (Array.isArray(v)) return v.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n>=0 && n<=6);
  const str = String(v).trim();
  if (!str) return undefined;
  const map: Record<string, number> = { sun:0, sunday:0, mon:1, monday:1, tue:2, tuesday:2, wed:3, wednesday:3, thu:4, thursday:4, fri:5, friday:5, sat:6, saturday:6 };
  const parts = str.split(/[,\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const nums = parts.map((p) => (p in map ? map[p] : Number(p))).filter((n) => Number.isFinite(n) && n>=0 && n<=6) as number[];
  return nums.length ? nums : undefined;
};

const parseNumber = (v?: string | number): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  return Number.isFinite(n) ? n : undefined;
};

// Color name to hex mapping
const COLOR_NAME_MAP: Record<string, string> = {
  'blue': '#3B82F6',
  'red': '#EF4444',
  'yellow': '#FBBF24',
  'green': '#10B981',
  'purple': '#A78BFA',
  'pink': '#EC4899',
  'orange': '#F97316',
  'cyan': '#06B6D4',
  'indigo': '#6366F1',
  'gray': '#6B7280',
  'slate': '#64748B',
  'stone': '#78716C',
  'neutral': '#737373',
  'zinc': '#71717A',
  'rose': '#F43F5E',
  'amber': '#F59E0B',
  'lime': '#84CC16',
  'emerald': '#10B981',
  'teal': '#14B8A6',
  'sky': '#0EA5E9',
  'violet': '#8B5CF6',
  'fuchsia': '#D946EF',
};

// Convert color name to hex if needed
const normalizeColor = (colorInput: string): string | null => {
  if (!colorInput) return null;
  
  const trimmed = colorInput.trim();
  
  // Check if it's already a hex code
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Check if it's hex without #
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return '#' + trimmed;
  }
  
  // Try to find color name in map (case-insensitive)
  const colorName = trimmed.toLowerCase();
  if (colorName in COLOR_NAME_MAP) {
    return COLOR_NAME_MAP[colorName];
  }
  
  return null;
};

// Normalize row keys: e.g. "Start Date" -> "start_date"
const normalizeKeys = (row: Record<string, any>): Record<string, any> => {
  const out: Record<string, any> = {};
  Object.entries(row).forEach(([k, v]) => {
    const key = String(k).trim().toLowerCase().replace(/[\s-]+/g, '_');
    out[key] = v;
    
    // Thêm các alias cho title để dễ tìm
    if (['title', 'event_title', 'task_title', 'name', 'event_name', 'task_name'].includes(key)) {
      out['title'] = v;
      out['event_title'] = v;
      out['task_title'] = v;
      out['name'] = v;
    }
    
    // Thêm các alias cho repeat
    if (['repeat', 'repeat_type', 'recurring', 'recurrence'].includes(key)) {
      out['repeat'] = v;
      out['repeat_type'] = v;
    }
    
    // Thêm các alias cho color và normalize color name to hex
    if (['color', 'event_color', 'color_code', 'hex_color', 'event_color_code'].includes(key)) {
      const normalizedColor = normalizeColor(String(v || ''));
      out['color'] = normalizedColor;
      out['event_color'] = normalizedColor;
    }
  });
  return out;
};

export const EventExcelImportModal: React.FC<EventExcelImportModalProps> = ({ isOpen, onClose, onImported }) => {
  const { t } = useAppTranslate('task');
  const { canImport } = useCanImport();
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const userId = useAppSelector((state: RootState) => state.auth.user?._id);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [errors, setErrors] = useState<{ rowIndex: number; message: string }[]>([]);

  console.log('🔍 EventExcelImportModal render, isOpen:', isOpen);

  const eventTemplateHeaders = useMemo(
    () => [
      'title',
      'start_date',
      'start_time',
      'end_time',
      'repeat',
      'to_date',
      'description',
      'color',
    ],
    []
  );

  // Template download moved to Task header; modal handles import only

  const handleChooseFile = () => {
    if (!canImport) {
      setShowRestrictedModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      return;
    }

    setFileName(file.name);
    setParsing(true);
    setErrors([]);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
      console.log('📄 Parsed JSON from Excel:', json);
      console.log('📋 Total rows parsed:', json.length);
      if (json.length > 0) {
        console.log('🔍 First row keys:', Object.keys(json[0]));
        console.log('🔍 First row data:', json[0]);
      }
      setRows(json);
    } catch (err) {
      console.error('❌ Error parsing Excel:', err);
    } finally {
      setParsing(false);
    }
  };

  const processImport = async () => {
    console.log('📥 processImport started');
    console.log('📊 Total rows to process:', rows.length);
    if (!rows.length) {
      console.warn('⚠️ No rows to process');
      return;
    }

    // Check if user is authenticated
    if (!userId) {
      console.error('❌ No userId found');
      return;
    }

    setProcessing(true);
    setErrors([]);

    let createdCount = 0;
    const rowErrors: { rowIndex: number; message: string }[] = [];

    let dataRowCount = 0;
    for (let i = 0; i < rows.length; i++) {
      const rRaw = rows[i] as any;
      // Bỏ qua dòng trống (tất cả giá trị đều rỗng hoặc chỉ chứa whitespace)
      const hasData = Object.values(rRaw).some(value => 
        value !== null && value !== undefined && value.toString().trim() !== ''
      );
      if (!hasData) {
        console.log('Skipping empty row:', i + 2);
        continue;
      }
      // Sequential index for non-empty input rows (Event 1, Event 2, ...)
      dataRowCount += 1;
      const eventIndex = dataRowCount;
      const r = normalizeKeys(rRaw);
      const rowIndex = i + 2; // header is row 1
      
      console.log(`\n📝 Processing Event ${eventIndex} (row ${rowIndex}):`);
      console.log('   Original keys:', Object.keys(rRaw));
      console.log('   Normalized keys:', Object.keys(r));
      console.log('   Raw data:', rRaw);

      // Validate title
      const titleValue = r['title'] ?? r['event_title'] ?? r['task_title'] ?? r['name'] ?? r['event_name'] ?? r['task_name'];
      const title = titleValue && titleValue.toString().trim() !== '' ? titleValue.toString().trim() : null;
      if (!title) {
        const errorMsg = `Event ${eventIndex}: Title is required`;
        console.error('❌ Validation Error:', errorMsg);
        console.log('   Row data:', rRaw);
        rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
        continue;
      }
      
      // Validate title length (max 50 characters)
      if (title.length > 50) {
        const errorMsg = `Event ${eventIndex}: Validation failed: title length invalid`;
        console.error('❌ Validation Error:', errorMsg);
        console.log('   Title length:', title.length);
        rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
        continue;
      }
      console.log('   ✅ Title:', title);

      // Validate start_time (require both start_date and start_time, accept hh:mm string, number (Excel), or Date)
      const allDay = toBoolean(r['all_day']);
      const hasStartDate = r['start_date'] && String(r['start_date']).trim() !== '';
      const hasStartTime = r['start_time'] && String(r['start_time']).trim() !== '';
      let startISO: string | undefined = undefined;
      let endISO: string | undefined = undefined;

      if (!hasStartDate || !hasStartTime) {
        const errorMsg = `Event ${eventIndex}: Start time is required`;
        console.error('❌ Validation Error:', errorMsg);
        console.log('hasStartDate:', hasStartDate, 'hasStartTime:', hasStartTime);
        console.log('Row data:', rRaw);
        rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
        continue;
      }

      // Validate start_time format (accept hh:mm string, number (Excel), or Date)
      const startTimeVal = r['start_time'];
      const isStartTimeValid = isTimeHM(startTimeVal) || typeof startTimeVal === 'number' || startTimeVal instanceof Date;
      if (!isStartTimeValid) {
        const errorMsg = `Event ${eventIndex}: Invalid start time format. Use hh:mm format (e.g., 09:30)`;
        console.error('❌ Validation Error:', errorMsg);
        console.log('startTimeVal:', startTimeVal, 'type:', typeof startTimeVal);
        rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
        continue;
      }

      // Build start ISO
      startISO = combineDateTimeToISO(r['start_date'], r['start_time'], r['start_time'], false);
      if (!startISO) {
        const errorMsg = `Event ${eventIndex}: Could not parse start date/time. Use formats: dd/mm/yyyy hh:mm or yyyy-mm-dd hh:mm`;
        console.error('❌ Validation Error:', errorMsg);
        console.log('start_date:', r['start_date'], 'start_time:', r['start_time']);
        rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
        continue;
      }

      // Validate end_time (required; accept hh:mm string, number (Excel), or Date)
      const hasEndTime = r['end_time'] !== undefined && r['end_time'] !== null && String(r['end_time']).trim() !== '';
      if (!hasEndTime) {
        const errorMsg = `Event ${eventIndex}: End time is required`;
        console.error('❌ Validation Error:', errorMsg);
        console.log('end_time:', r['end_time']);
        rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
        continue;
      }

      // Validate end_time format (accept hh:mm string, number (Excel), or Date)
      const endTimeVal = r['end_time'];
      const isEndTimeValid = isTimeHM(endTimeVal) || typeof endTimeVal === 'number' || endTimeVal instanceof Date;
      if (!isEndTimeValid) {
        const errorMsg = `Event ${eventIndex}: Invalid end time format. Use hh:mm format (e.g., 17:30)`;
        console.error('❌ Validation Error:', errorMsg);
        console.log('endTimeVal:', endTimeVal, 'type:', typeof endTimeVal);
        rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
        continue;
      }

      // Build end ISO
      endISO = combineDateTimeToISO(r['start_date'], r['end_time'], r['end_time'], false);
      if (!endISO) {
        const errorMsg = `Event ${eventIndex}: Could not parse end date/time. Use formats: dd/mm/yyyy hh:mm or yyyy-mm-dd hh:mm`;
        console.error('❌ Validation Error:', errorMsg);
        console.log('start_date:', r['start_date'], 'end_time:', r['end_time']);
        rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
        continue;
      }

      // Validate end time must be after start time
      const startDate = new Date(startISO);
      const endDate = new Date(endISO);
      if (endDate <= startDate) {
        const errorMsg = `Event ${eventIndex}: End time must be after start time`;
        console.error('❌ Validation Error:', errorMsg);
        console.log('startDate:', startDate.toISOString(), 'endDate:', endDate.toISOString());
        rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
        continue;
      }

      // Validate start time is not in the past - check today's time requirement
      const now = new Date();
      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      const todayOnly = new Date(now);
      todayOnly.setHours(0, 0, 0, 0);

      // If date is past, reject
      if (startDateOnly.getTime() < todayOnly.getTime()) {
        const errorMsg = `Event ${eventIndex}: Start date cannot be in the past`;
        console.error('❌ Validation Error:', errorMsg);
        rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
        continue;
      }

      // If date is today, check that start time is greater than current time
      if (startDateOnly.getTime() === todayOnly.getTime()) {
        if (startDate <= now) {
          const errorMsg = `Event ${eventIndex}: Start time must be greater than current time for today`;
          console.error('❌ Validation Error:', errorMsg);
          rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
          continue;
        }
      }

      // Validate repeat fields
  const rawRepeat = r['repeat'] ?? r['repeat_type'] ?? r['recurring'] ?? r['recurrence'];
      const repeatType = normalizeRepeatSelection(rawRepeat?.toString?.());
      
      // Convert repeatType to repeatUnit automatically
      // If repeatType is provided, derive the unit from it; otherwise check repeat_unit column
      let repeatUnit: RepeatUnit | undefined;
      if (repeatType !== 'none') {
        // Map repeatType to RepeatUnit
        if (['daily', 'day'].includes(repeatType)) repeatUnit = 'day';
        else if (['weekly', 'week'].includes(repeatType)) repeatUnit = 'week';
        else if (['monthly', 'month'].includes(repeatType)) repeatUnit = 'month';
        else if (['yearly', 'year'].includes(repeatType)) repeatUnit = 'year';
        else if (repeatType === 'weekday') repeatUnit = 'day'; // weekday maps to day unit
        else if (repeatType === 'custom') repeatUnit = normalizeRepeatUnit(r['repeat_unit']?.toString?.());
      } else {
        // If no repeat type, still try to get unit from repeat_unit column
        repeatUnit = normalizeRepeatUnit(r['repeat_unit']?.toString?.());
      }
      const repeatInterval = parseNumber(r['repeat_interval']);
      const repeatDays = parseRepeatDays(r['repeat_days']);
      const repeatOccurrences = parseNumber(r['repeat_occurrences']);
      const exclusionDatesRaw = r['exclusion_dates'];
      const exclusionDates = Array.isArray(exclusionDatesRaw)
        ? exclusionDatesRaw
            .map((item: any) => parseDateTimeFlexible(item))
            .filter((s): s is string => !!s)
        : (exclusionDatesRaw
          ? String(exclusionDatesRaw)
              .split(/[;, a0\s]+/)
              .map((s) => parseDateTimeFlexible(s))
              .filter((s): s is string => !!s)
          : undefined);
      const repeatEndType = normalizeRepeatEndType(r['repeat_end_type']?.toString?.());

      // Validate repeat logic
      if (repeatType !== 'none') {
        // Check if to_date is provided when repeat is not 'none'
        const hasToDate = r['to_date'] && String(r['to_date']).trim() !== '';
        if (!hasToDate) {
          const errorMsg = `Event ${eventIndex}: Request failed with status code 400`;
          console.error('❌ Validation Error:', errorMsg);
          console.log('repeatType:', repeatType, 'to_date missing');
          rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
          continue;
        }
        
        // Parse to_date and validate it's after start_date
        const toDateISO = combineDateTimeToISO(r['to_date'], undefined, r['to_date'], true);
        if (toDateISO) {
          const toDate = new Date(toDateISO);
          if (toDate <= startDate) {
            const errorMsg = `Event ${eventIndex}: Request failed with status code 400`;
            console.error('❌ Validation Error: to_date must be after start_date');
            console.log('startDate:', startDate.toISOString(), 'toDate:', toDate.toISOString());
            rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
            continue;
          }
        }
        
        if (!repeatUnit) {
          const errorMsg = `Event ${eventIndex}: Invalid repeat unit. Use: daily, weekly, monthly, yearly`;
          console.error('❌ Validation Error:', errorMsg);
          console.log('repeatUnit:', repeatUnit, 'repeatType:', repeatType);
          rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
          continue;
        }
        if (repeatInterval !== undefined && (!Number.isFinite(repeatInterval) || repeatInterval < 1)) {
          const errorMsg = `Event ${eventIndex}: Invalid repeat interval. Must be a positive number`;
          console.error('❌ Validation Error:', errorMsg);
          console.log('repeatInterval:', repeatInterval);
          rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
          continue;
        }
        if (repeatEndType && !['never', 'on', 'after'].includes(repeatEndType)) {
          const errorMsg = `Event ${eventIndex}: Invalid repeat end type. Use: never, on, after`;
          console.error('❌ Validation Error:', errorMsg);
          console.log('repeatEndType:', repeatEndType);
          rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
          continue;
        }
      }

      // Validate guests (if present)
      const guestsRaw = r['guests'];
      let guestsList: string[] | undefined = undefined;
      if (guestsRaw) {
        if (Array.isArray(guestsRaw)) {
          guestsList = guestsRaw.map((g: any) => String(g).trim()).filter(Boolean);
        } else if (typeof guestsRaw === 'string') {
          guestsList = String(guestsRaw).split(',').map((s) => s.trim()).filter(Boolean);
        } else {
          const errorMsg = `Event ${eventIndex}: Guests must be a list or comma-separated string`;
          console.error('❌ Validation Error:', errorMsg);
          console.log('guestsRaw:', guestsRaw, 'type:', typeof guestsRaw);
          rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
          continue;
        }
      }

      // Validate color (if present)
      let colorValue: string | undefined = undefined;
      if (r['color']) {
        // Color should already be normalized to hex by normalizeKeys
        const colorValue_temp = String(r['color']).trim();
        if (colorValue_temp) {
          console.log('🎨 Color validation - normalized value:', colorValue_temp);
          
          // Validate hex format (should be valid after normalization)
          if (!/^#[0-9A-Fa-f]{6}$/.test(colorValue_temp)) {
            const errorMsg = `Event ${eventIndex}: Color must be valid hex format or color name (e.g., #3B82F6, 3B82F6, or "Blue"). Got: ${colorValue_temp}`;
            console.error('❌ Validation Error:', errorMsg);
            rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
            continue;
          }
          
          colorValue = colorValue_temp;
          console.log('✅ Color validation passed:', colorValue);
        }
      }

      // Validate description (optional, convert to string if present)
      if (r['description']) {
        r['description'] = String(r['description']);
      }

      // Validate location (optional, but must be string if present)
      if (r['location'] && typeof r['location'] !== 'string') {
        const errorMsg = `Event ${eventIndex}: Location must be a valid text value`;
        console.error('❌ Validation Error:', errorMsg);
        console.log('location:', r['location'], 'type:', typeof r['location']);
        rowErrors.push({ rowIndex: eventIndex, message: errorMsg });
        continue;
      }

      // Validate repeat_end_date (if present)
      const repeatEndDateISO = combineDateTimeToISO(
        r['repeat_end_date'] || r['to_date'],
        undefined,
        r['repeat_end_date'] || r['to_date'],
        true
      );
      if (repeatEndType === 'on' && !repeatEndDateISO) {
        rowErrors.push({ rowIndex: eventIndex, message: `Event ${eventIndex}: Invalid repeat end date. Use formats: dd/mm/yyyy or yyyy-mm-dd` });
        continue;
      }

      // Build payload
      const payload: CreateTaskEventRequest = {
        user_id: userId,
        title,
        start_time: startISO,
        end_time: endISO || undefined,
        all_day: allDay,
        repeat_type: repeatType,
        ...(repeatType !== 'none' && {
          repeat_interval: repeatInterval || 1,
          repeat_unit: repeatUnit,
          repeat_days: repeatDays,
          repeat_end_type: repeatEndType || 'never',
          ...((repeatEndType === 'on' || !repeatEndType) && { repeat_end_date: repeatEndDateISO }),
          ...(exclusionDates ? { exclusion_dates: exclusionDates } : {}),
        }),
        location: r['location']?.toString() || undefined,
        description: r['description']?.toString() || undefined,
        guests: guestsList,
        color: colorValue || undefined,
      };
      console.log('Final payload for row', rowIndex, ':', payload);

      try {
        await taskEventService.createTaskEvent(payload);
        createdCount += 1;
      } catch (e: any) {
        console.error('Row error', e);
        rowErrors.push({ rowIndex: eventIndex, message: `Event ${eventIndex}: ${e?.message || 'Unknown error'}` });
      }
    }

    setProcessing(false);
    setErrors(rowErrors);

    // Log validation summary
    if (rowErrors.length > 0) {
      console.error(`❌ Import completed with ${rowErrors.length} error(s):`);
      rowErrors.forEach((err) => {
        console.log(`  - Row ${err.rowIndex}: ${err.message}`);
      });
    } else {
      console.log(`✅ All events validated successfully! Created: ${createdCount}`);
    }

    // Show success toast if any events were created
    if (createdCount > 0) {
      const SuccessMessage = () => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-900">Import successful!</p>
            <p className="text-sm text-green-800">{createdCount} event{createdCount > 1 ? 's' : ''} imported successfully</p>
          </div>
        </div>
      );
      toast.success(<SuccessMessage />, {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'bg-green-50 border border-green-200 shadow-lg',
        progressClassName: 'bg-green-500'
      });
    }

    console.log('📤 Calling onImported callback with:', { createdCount, errors: rowErrors });
    // Gọi callback để refresh events trên UI
    if (onImported) {
      console.log('🔔 About to call onImported callback');
      try {
        const result = onImported({ createdCount, errors: rowErrors });
        // If result is a Promise, await it
        if (result instanceof Promise) {
          await result;
        }
        console.log('✅ onImported callback finished - Events refreshed');
      } catch (err) {
        console.error('❌ Error in onImported callback:', err);
      }
    } else {
      console.log('⚠️ onImported callback not provided');
    }
    
  // Keep modal open so user can review any errors that occurred
  // Modal stays open until user manually closes it via Close/Cancel button
  // This allows user to see and understand what went wrong
};

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('import_excel')}</h2>
            <button 
              aria-label={t('close')} 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors z-10"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <button onClick={handleChooseFile} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm border">
                {t('choose_file')}
              </button>
              {fileName && (
                <span className="text-sm text-gray-600 truncate">{fileName}</span>
              )}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept=".xlsx" 
                className="hidden" 
                onChange={onFileChange} 
                title={t('choose_excel_file')}
                placeholder={t('choose_excel_file')}
              />
            </div>

            <p className="text-xs text-gray-500">{t('template_columns')}</p>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-medium text-gray-700 mb-3">{t('template_sheet_name')}</div>
              <div className="flex flex-wrap gap-2">
                {eventTemplateHeaders.map((key) => (
                  <span key={key} className="inline-flex items-center rounded-md bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow ring-1 ring-gray-200 flex-shrink-0 whitespace-nowrap">
                    {t(`column_${key}` as any)}
                  </span>
                ))}
              </div>
            </div>

            {(parsing || processing) && (
              <div className="text-sm text-gray-700">{parsing ? t('parsing_file') : t('processing')}</div>
            )}

            <div className="flex items-center justify-end space-x-2">
              <button 
                onClick={onClose}
                className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm transition-colors"
                title="Close modal"
              >
                {t('cancel')}
              </button>
              <button disabled={parsing || processing || !rows.length} onClick={processImport} className={`px-3 py-2 rounded-md text-white text-sm ${parsing || processing || !rows.length ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'}`}>
                {t('start_import')}
              </button>
            </div>

            {errors.length > 0 && (
                <div className="mt-2 p-3 border rounded-md bg-red-50 border-red-200">
                  <ul className="list-disc ml-4 text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                    {errors.map(er => (
                      <li key={er.rowIndex}>{er.message}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      </div>

      <ImportRestrictedModal
        isOpen={showRestrictedModal}
        onClose={() => setShowRestrictedModal(false)}
      />
    </>
  );
};

export default EventExcelImportModal;