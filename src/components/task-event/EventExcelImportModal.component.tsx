import React, { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { taskEventService } from '../../services/task-event.service';
import type { CreateTaskEventRequest } from '../../types/task-events/request/create-task-event.request';
import type { RepeatEndType, RepeatType, RepeatUnit } from '../../types/task-events/task-events.types';

interface EventExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onImported?: (result: { createdCount: number; errors: { rowIndex: number; message: string }[] }) => void;
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
  if ([
    'does not repeat', "doesn't repeat", 'doesnt repeat', 'no repeat', 'none',
    'không lặp', 'không lặp lại', 'khong lap', 'khong lap lai'
  ].includes(s)) return 'none';
  if (['daily', 'hàng ngày', 'hang ngay', 'ngày', 'ngay'].includes(s)) return 'daily';
  if (['weekly', 'hàng tuần', 'hang tuan', 'tuần', 'tuan'].includes(s)) return 'weekly';
  if (['monthly', 'hàng tháng', 'hang thang', 'tháng', 'thang'].includes(s)) return 'monthly';
  if (['yearly', 'hàng năm', 'hang nam', 'năm', 'nam', 'annually', 'annual'].includes(s)) return 'yearly';
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

const toISOFromParts = (
  dateStr?: string,
  timeStr?: string,
  fallback?: string,
  allDay?: boolean,
  isEnd?: boolean
): string | undefined => {
  const dateParts = parseDMY(dateStr);
  if (dateParts) {
    let h = 0;
    let mi = 0;
    if (isTimeHM(timeStr)) {
      const [hh, mm] = String(timeStr).split(':').map(Number);
      h = hh;
      mi = mm;
    } else if (allDay) {
      if (isEnd) {
        h = 23; mi = 59;
      } else {
        h = 0; mi = 0;
      }
    }
    const dt = new Date(dateParts.y, dateParts.m - 1, dateParts.d, h, mi, isEnd && allDay ? 59 : 0, isEnd && allDay ? 999 : 0);
    return dt.toISOString();
  }
  // If no date parts, try fallback as ISO or parseable date
  const fb = (fallback || '').trim();
  if (fb) {
    const d = new Date(fb);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return undefined;
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

// Normalize row keys: e.g. "Start Date" -> "start_date"
const normalizeKeys = (row: Record<string, any>): Record<string, any> => {
  const out: Record<string, any> = {};
  Object.entries(row).forEach(([k, v]) => {
    const key = String(k).trim().toLowerCase().replace(/[\s-]+/g, '_');
    out[key] = v;
  });
  return out;
};

export const EventExcelImportModal: React.FC<EventExcelImportModalProps> = ({ isOpen, onClose, taskId, onImported }) => {
  const { t } = useAppTranslate('task');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [errors, setErrors] = useState<{ rowIndex: number; message: string }[]>([]);

  const eventTemplateHeaders = useMemo(
    () => [
      'title',
      'start_date',
      'start_time',
      'end_time',
      'repeat',
      'to_date',
      'description',
    ],
    []
  );

  // Template download moved to Task header; modal handles import only

  const handleChooseFile = () => fileInputRef.current?.click();

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast.error(t('invalid_file_type'));
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
      setRows(json);
      if (!json.length) toast.warn(t('no_rows_found'));
    } catch (err) {
      console.error(err);
      toast.error(t('import_failed'));
    } finally {
      setParsing(false);
    }
  };

  const processImport = async () => {
    if (!rows.length) {
      toast.warn(t('no_rows_found'));
      return;
    }
    setProcessing(true);
    setErrors([]);

    let createdCount = 0;
    const rowErrors: { rowIndex: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rRaw = rows[i] as any;
      const r = normalizeKeys(rRaw);
      const rowIndex = i + 2; // header is row 1
      try {
        const title = (r['title'] ?? r['event_title'])?.toString().trim();
        if (!title) throw new Error(t('missing_title'));

        const allDay = toBoolean(r['all_day']);

        const startISO =
          toISOFromParts(r['start_date'], isTimeHM(r['start_time']) ? r['start_time'] : undefined, typeof r['start_time'] === 'string' ? r['start_time'] : String(r['start_time'] ?? ''), !!allDay, false) ||
          parseDateTimeFlexible(r['start_time']);
        if (!startISO) throw new Error(t('unknown_error'));

        const endISO =
          toISOFromParts(r['to_date'] || r['end_date'], isTimeHM(r['end_time']) ? r['end_time'] : undefined, typeof r['end_time'] === 'string' ? r['end_time'] : String(r['end_time'] ?? ''), !!allDay, true) ||
          parseDateTimeFlexible(r['end_time']);

        const repeatType = normalizeRepeatSelection(r['repeat']) || normalizeRepeatType(r['repeat_type']);
        const repeatEndType = normalizeRepeatEndType(r['repeat_end_type']);
        const repeatUnit = normalizeRepeatUnit(r['repeat_unit']);
        const repeatInterval = parseNumber(r['repeat_interval']);
        const repeatOccurrences = parseNumber(r['repeat_occurrences']);
        const repeatDays = parseRepeatDays(r['repeat_days']);
        const exclusionDates = (r['exclusion_dates']?.toString() || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
          .map((d: string) => {
            const p = parseDMY(d);
            if (p) return new Date(p.y, p.m - 1, p.d).toISOString();
            const dt = new Date(d);
            return isNaN(dt.getTime()) ? undefined : dt.toISOString();
          })
          .filter(Boolean) as string[];

        const guests = (r['guests']?.toString() || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => !!s);

        const payload: CreateTaskEventRequest = {
          task_id: taskId,
          title,
          start_time: startISO,
          end_time: endISO,
          all_day: allDay,
          repeat_type: repeatType,
          repeat_interval: repeatInterval,
          repeat_unit: repeatUnit,
          repeat_days: repeatDays,
          repeat_end_type: repeatEndType,
          repeat_end_date: toISOFromParts(r['repeat_end_date'], undefined, r['repeat_end_date'], true, true),
          repeat_occurrences: repeatOccurrences,
          exclusion_dates: exclusionDates,
          location: r['location']?.toString() || undefined,
          description: r['description']?.toString() || undefined,
          guests,
          color: r['color']?.toString() || undefined,
        };

        await taskEventService.createTaskEvent(payload);
        createdCount += 1;
      } catch (e: any) {
        console.error('Row error', e);
        rowErrors.push({ rowIndex, message: e?.message || t('unknown_error') });
      }
    }

    setProcessing(false);
    setErrors(rowErrors);

    if (createdCount > 0) {
      toast.success(t('import_success', { count: createdCount }));
    }
    if (rowErrors.length > 0) {
      rowErrors.slice(0, 3).forEach(er => toast.error(t('row_error', { index: er.rowIndex, message: er.message })));
    }

    onImported?.({ createdCount, errors: rowErrors });
    if (rowErrors.length === 0) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('import_excel')}</h2>
          <button aria-label={t('close')} onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
            <input ref={fileInputRef} type="file" accept=".xlsx" className="hidden" onChange={onFileChange} />
          </div>

          <p className="text-xs text-gray-500">{t('template_columns')}</p>

          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-medium text-gray-700 mb-2">{t('template_sheet_name')}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {eventTemplateHeaders.map((key) => (
                <span key={key} className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow ring-1 ring-gray-200">
                  {t(`column_${key}` as any)}
                </span>
              ))}
            </div>
          </div>

          {(parsing || processing) && (
            <div className="text-sm text-gray-700">{parsing ? t('parsing_file') : t('processing')}</div>
          )}

          <div className="flex items-center justify-end space-x-2">
            <button onClick={onClose} className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm">
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
                  <li key={er.rowIndex}>{t('row_error', { index: er.rowIndex, message: er.message })}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventExcelImportModal;