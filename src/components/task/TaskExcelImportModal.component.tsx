import React, { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import taskService from '../../services/task.service';
import { taskEventService } from '../../services/task-event.service';
import tagService from '../../services/tag.service';
import type { Task } from '../../types/task/response/task.response';
import type { TaskImportRow, TaskImportResult, TaskImportParseError } from '../../types/import/task-import.types';
import type { CreateTaskEventRequest } from '../../types/task-events/request/create-task-event.request';
import type { RepeatType, RepeatEndType, RepeatUnit } from '../../types/task-events/task-events.types';

interface TaskExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported?: (result: TaskImportResult) => void;
}

const toBoolean = (val: any): boolean | undefined => {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  const s = String(val).trim().toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(s)) return true;
  if (['false', 'no', 'n', '0'].includes(s)) return false;
  return undefined;
};

const normalizePriority = (p?: string): Task['priority'] | undefined => {
  if (!p) return undefined;
  const s = p.toString().trim().toLowerCase();
  if (['high', 'p1', '1'].includes(s)) return 'high';
  if (['medium', 'med', 'p2', '2'].includes(s)) return 'medium';
  if (['low', 'p3', '3'].includes(s)) return 'low';
  return undefined;
};

const normalizeStatus = (s?: string): Task['status'] | undefined => {
  if (!s) return undefined;
  const v = s.toString().trim().toLowerCase();
  if (['pending', 'in_progress', 'in-progress', 'todo', 'to-do'].includes(v)) return 'pending';
  if (['completed', 'done', 'finished', 'complete'].includes(v)) return 'completed';
  if (['overdue', 'late'].includes(v)) return 'overdue';
  return undefined;
};

const normalizeRepeatType = (v?: string): RepeatType | undefined => {
  if (!v) return undefined;
  const s = v.toString().trim().toLowerCase();
  if (['none', 'no', 'off'].includes(s)) return 'none';
  if (['daily', 'day', 'everyday'].includes(s)) return 'daily';
  if (['weekly', 'week'].includes(s)) return 'weekly';
  if (['monthly', 'month'].includes(s)) return 'monthly';
  if (['yearly', 'year', 'annually', 'annual'].includes(s)) return 'yearly';
  if (['weekday', 'weekdays'].includes(s)) return 'weekday';
  if (['custom', 'customize'].includes(s)) return 'custom';
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

const normalizeRepeatEndType = (v?: string): RepeatEndType | undefined => {
  if (!v) return undefined;
  const s = v.toString().trim().toLowerCase();
  if (['never', 'no', 'none'].includes(s)) return 'never';
  if (['on', 'on_date', 'date', 'until'].includes(s)) return 'on';
  if (['after', 'after_occurrences', 'occurrences'].includes(s)) return 'after';
  return undefined;
};

const parseNumber = (v?: string | number): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  return Number.isFinite(n) ? n : undefined;
};

const parseDateString = (v?: string): string | undefined => {
  if (!v) return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  // Let backend accept ISO, task.service will toISOString when needed
  // If user provides date-only, still pass as-is
  return s;
};

const parseDays = (v?: string | number[]): number[] | undefined => {
  if (!v) return undefined;
  if (Array.isArray(v)) return v.map(n => Number(n)).filter(n => n >= 0 && n <= 6);
  const parts = String(v)
    .split(',')
    .map(s => Number(s.trim()))
    .filter(n => Number.isFinite(n) && n >= 0 && n <= 6);
  return parts.length ? parts : undefined;
};

// Helpers to combine date + time into ISO
const isTimeHM = (s?: any): boolean => {
  if (s === undefined || s === null) return false;
  const st = String(s).trim();
  return /^\d{1,2}:\d{2}$/.test(st);
};
const parseDMY = (s?: any): { y: number; m: number; d: number } | undefined => {
  if (s === undefined || s === null) return undefined;
  const st = String(s).trim();
  const m = st.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // dd/mm/yyyy
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) return { y, m: mo, d };
  }
  const m2 = st.match(/^(\d{4})-(\d{2})-(\d{2})$/); // yyyy-mm-dd
  if (m2) {
    const y = Number(m2[1]);
    const mo = Number(m2[2]);
    const d = Number(m2[3]);
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) return { y, m: mo, d };
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
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/); // dd/mm/yyyy hh:mm
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    const h = Number(m[4]);
    const mi = Number(m[5]);
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && h >= 0 && h <= 23 && mi >= 0 && mi <= 59) {
      const dt = new Date(y, mo - 1, d, h, mi, 0, 0);
      return dt.toISOString();
    }
  }
  const m2 = str.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})$/); // yyyy-mm-dd hh:mm
  if (m2) {
    const y = Number(m2[1]);
    const mo = Number(m2[2]);
    const d = Number(m2[3]);
    const h = Number(m2[4]);
    const mi = Number(m2[5]);
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && h >= 0 && h <= 23 && mi >= 0 && mi <= 59) {
      const dt = new Date(y, mo - 1, d, h, mi, 0, 0);
      return dt.toISOString();
    }
  }
  const dt = new Date(str);
  return isNaN(dt.getTime()) ? undefined : dt.toISOString();
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

const splitTags = (v?: string): string[] => {
  if (!v) return [];
  return v
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
};

const randomColor = () => {
  const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];
  return colors[Math.floor(Math.random() * colors.length)];
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

export const TaskExcelImportModal: React.FC<TaskExcelImportModalProps> = ({ isOpen, onClose, onImported }) => {
  const { t } = useAppTranslate('task');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [errors, setErrors] = useState<TaskImportParseError[]>([]);

  const taskTemplateHeaders = useMemo(
    () => [
      'title',
      'description',
      'start_date',
      'start_time',
      'end_date',
      'end_time',
    ],
    []
  );

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
      if (!json.length) {
        toast.warn(t('no_rows_found'));
      }
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
    const rowErrors: TaskImportParseError[] = [];
    const rowSuccesses: { rowIndex: number; title?: string }[] = [];

    const getErrorMessage = (e: any): string => {
      if (!e) return t('unknown_error');
      if (typeof e.message === 'string' && e.message) return e.message;
      const m = e?.response?.data?.message;
      if (Array.isArray(m)) return m.join('; ');
      if (typeof m === 'string' && m) return m;
      const err = e?.response?.data?.error;
      if (typeof err === 'string' && err) return err;
      return t('unknown_error');
    };

    // Fetch tags once to reduce calls
    let existingTags = await tagService.fetchAllUserTags();
    const tagMap = new Map(existingTags.map(tg => [tg.name.trim().toLowerCase(), tg]));

    for (let i = 0; i < rows.length; i++) {
      const rRaw = rows[i] as any;
      const r = normalizeKeys(rRaw);
      const rowIndex = i + 2; // considering header row at 1
      try {
        const title = (r['title'] ?? r['task_title'])?.toString().trim();
        if (!title) {
          throw new Error(t('missing_title'));
        }

        const taskPayload: Omit<Task, '_id'> = {
          title,
          description: r['description']?.toString() || undefined,
          priority: 'medium', // Default priority
          status: 'pending', // Default status
          start_time: combineDateTimeToISO(r['start_date'], r['start_time'], r['start_time'], false),
          end_time: combineDateTimeToISO(r['end_date'], r['end_time'], r['end_time'], false),
        };

        const createdTask = await taskService.createTask(taskPayload);
        createdCount += 1;
        rowSuccesses.push({ rowIndex, title });
      } catch (e: any) {
        console.error('Row error', e);
        rowErrors.push({ rowIndex, message: getErrorMessage(e) });
      }
    }

    setProcessing(false);
    setErrors(rowErrors);

    if (createdCount > 0) {
      // Summary
      toast.success(t('import_success', { count: createdCount }));
      // Per-row success notifications
      rowSuccesses.forEach(s => toast.success(`Row ${s.rowIndex}: Imported successfully${s.title ? ` - ${s.title}` : ''}`));
    }
    if (rowErrors.length > 0) {
      // Show all row errors with their reasons
      rowErrors.forEach(er => toast.error(t('row_error', { index: er.rowIndex, message: er.message })));
    }

    onImported?.({ createdCount, errors: rowErrors });
    // Keep modal open to show errors; close on success-only
    if (rowErrors.length === 0) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('import_excel')}</h2>
          <button
            aria-label={t('close')}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleChooseFile}
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm border"
            >
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
            />
          </div>

          <p className="text-xs text-gray-500">
            {t('template_columns')}
          </p>

          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-medium text-gray-700 mb-2">{t('template_sheet_name')}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {taskTemplateHeaders.map((key) => (
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
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
            >
              {t('cancel')}
            </button>
            <button
              disabled={parsing || processing || !rows.length}
              onClick={processImport}
              className={`px-3 py-2 rounded-md text-white text-sm ${parsing || processing || !rows.length ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'}`}
            >
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

export default TaskExcelImportModal;