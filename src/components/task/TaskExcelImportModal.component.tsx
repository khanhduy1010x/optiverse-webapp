import React, { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { useCanImport } from '../../hooks/import/useCanImport.hook';
import { useTaskLimitByMembership } from '../../hooks/import/useTaskLimitByMembership.hook';
import ImportRestrictedModal from '../import/ImportRestrictedModal.component';
import TaskLimitExceededUpgradeModal from '../import/TaskLimitExceededUpgradeModal.component';
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
  const { canImport } = useCanImport();
  const { isUnlimited, taskLimit } = useTaskLimitByMembership();
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const [showLimitExceededModal, setShowLimitExceededModal] = useState(false);
  const [tasksCreatedToday, setTasksCreatedToday] = useState(0);
  const [taskLimitError, setTaskLimitError] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [errors, setErrors] = useState<TaskImportParseError[]>([]);

  const taskTemplateHeaders = useMemo(
    () => [
      'title',
      'priority',
      'end_date',
      'end_time',
      'description',
    ],
    []
  );

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
      setRows(json);
    } catch (err) {
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  const processImport = async () => {
    if (!rows.length) {
      return;
    }

    setProcessing(true);
    setErrors([]);

    try {
      // ===== NEW: Check task limit BEFORE processing any tasks =====
      // Get current task count for today
      const currentTasksCreatedToday = await taskService.getTasksCreatedToday();
      
      // Count non-empty rows that we would try to import
      let dataRowCount = 0;
      for (let i = 0; i < rows.length; i++) {
        const rRaw = rows[i] as any;
        const hasData = Object.values(rRaw).some(
          (value) => value !== null && value !== undefined && value.toString().trim() !== ''
        );
        if (hasData) {
          dataRowCount += 1;
        }
      }
      
      const totalTasksIfImported = currentTasksCreatedToday + dataRowCount;
      
      console.log(`[processImport] currentTasksCreatedToday: ${currentTasksCreatedToday}`);
      console.log(`[processImport] dataRowCount to import: ${dataRowCount}`);
      console.log(`[processImport] totalTasksIfImported: ${totalTasksIfImported}`);
      console.log(`[processImport] taskLimit: ${taskLimit}`);
      
      // Check if importing would exceed limit (only for limited plans)
      if (!isUnlimited && totalTasksIfImported > taskLimit) {
        console.log(`[processImport] ❌ Import would exceed limit!`);
        setProcessing(false);
        
        // Show modal WITHOUT importing any tasks
        setTasksCreatedToday(currentTasksCreatedToday);
        setTaskLimitError({
          details: {
            tasksCreatedToday: currentTasksCreatedToday,
            taskLimit: taskLimit,
            remainingTasks: Math.max(0, taskLimit - currentTasksCreatedToday),
          }
        });
        setShowLimitExceededModal(true);
        return;
      }
      // ===== END: Pre-check limit =====

      let createdCount = 0;
      const rowErrors: TaskImportParseError[] = [];

      // Fetch tags once to reduce calls
      let existingTags = await tagService.fetchAllUserTags();
      const tagMap = new Map(existingTags.map(tg => [tg.name.trim().toLowerCase(), tg]));

      let dataRowCount2 = 0;
      for (let i = 0; i < rows.length; i++) {
        const rRaw = rows[i] as any;

        // Skip completely empty rows
        const hasData = Object.values(rRaw).some(
          (value) => value !== null && value !== undefined && value.toString().trim() !== ''
        );
        if (!hasData) {
          console.log('Skipping empty row:', i + 2);
          continue;
        }

        // Sequential task number for non-empty rows (Task 1, Task 2, ...)
        dataRowCount2 += 1;
        const taskIndex = dataRowCount2;
        const r = normalizeKeys(rRaw);
        const rowIndex = i + 2; // Excel row number
        const errors: string[] = [];

        // 1. Validate title (required)
        const title = (r['title'] ?? r['task_title'])?.toString().trim();
        if (!title) {
          errors.push('Title is required');
          rowErrors.push({ rowIndex: taskIndex, message: `Task ${taskIndex}: Title is required` });
          continue;
        }
        
        // Validate title length (max 100 characters)
        if (title.length > 100) {
          errors.push('Title is too long (max 100 characters)');
          rowErrors.push({ rowIndex: taskIndex, message: `Task ${taskIndex}: Title is too long (max 100 characters)` });
          continue;
        }

        // 2. Validate end_time only (optional - user can skip deadline)
        const hasEndDate = r['end_date'] && String(r['end_date']).trim() !== '';
        const hasEndTime = r['end_time'] && String(r['end_time']).trim() !== '';
        
        let endISO: string | undefined = undefined;

        // Only validate end_time if at least one of them is provided
        if (hasEndDate || hasEndTime) {
          // If one is provided, the other must also be provided
          if (!hasEndDate || !hasEndTime) {
            errors.push('Both end date and end time must be provided together');
            rowErrors.push({ rowIndex: taskIndex, message: `Task ${taskIndex}: Both end date and end time must be provided together` });
            continue;
          }

          // Validate end_time format (accept hh:mm string, number (Excel), or Date)
          const endTimeVal = r['end_time'];
          const isEndTimeValid = isTimeHM(endTimeVal) || typeof endTimeVal === 'number' || endTimeVal instanceof Date;
          if (!isEndTimeValid) {
            errors.push('Invalid end time format. Use hh:mm format (e.g., 17:30)');
            rowErrors.push({ rowIndex: taskIndex, message: `Task ${taskIndex}: Invalid end time format. Use hh:mm format (e.g., 17:30)` });
            continue;
          }

          // Build end ISO
          endISO = combineDateTimeToISO(r['end_date'], r['end_time'], r['end_time'], false);
          if (!endISO) {
            errors.push('Could not parse end date/time. Use formats: dd/mm/yyyy hh:mm or yyyy-mm-dd hh:mm');
            rowErrors.push({ rowIndex: taskIndex, message: `Task ${taskIndex}: Could not parse end date/time. Use formats: dd/mm/yyyy hh:mm or yyyy-mm-dd hh:mm` });
            continue;
          }

          // Validate end date/time is not in the past
          const endDate = new Date(endISO);
          const now = new Date();
          
          // Check if date is today and time must be greater than current time
          const endDateOnly = new Date(endDate);
          endDateOnly.setHours(0, 0, 0, 0);
          const todayOnly = new Date(now);
          todayOnly.setHours(0, 0, 0, 0);
          
          // If date is past, reject
          if (endDateOnly.getTime() < todayOnly.getTime()) {
            errors.push('End date/time cannot be in the past');
            rowErrors.push({ rowIndex: taskIndex, message: `Task ${taskIndex}: End date/time cannot be in the past` });
            continue;
          }
          
          // If date is today, check that time is greater than current time
          if (endDateOnly.getTime() === todayOnly.getTime()) {
            if (endDate <= now) {
              errors.push('Time must be greater than current time for today');
              rowErrors.push({ rowIndex: taskIndex, message: `Task ${taskIndex}: Time must be greater than current time for today` });
              continue;
            }
          }
        }

        // 4. Validate priority (optional, default to 'low' if not provided)
        const priorityVal = r['priority'];
        let priority: Task['priority'] = 'low'; // default to 'low'
        if (priorityVal) {
          const normalized = normalizePriority(priorityVal?.toString());
          if (!normalized) {
            errors.push(`Invalid priority "${priorityVal}". Use: high, medium, low, p1, p2, p3, or 1, 2, 3`);
            rowErrors.push({ rowIndex: taskIndex, message: `Task ${taskIndex}: Invalid priority "${priorityVal}". Use: high, medium, low, p1, p2, p3, or 1, 2, 3` });
            continue;
          }
          priority = normalized;
        }

        // 5. Validate status (optional, but if provided must be valid)
        const statusVal = r['status'];
        let status: Task['status'] = 'pending'; // default
        if (statusVal) {
          const normalized = normalizeStatus(statusVal?.toString());
          if (!normalized) {
            errors.push(`Invalid status "${statusVal}". Use: pending, completed, overdue, in_progress, todo, done, finished, complete, late`);
            rowErrors.push({ rowIndex: taskIndex, message: `Task ${taskIndex}: Invalid status "${statusVal}". Use: pending, completed, overdue, in_progress, todo, done, finished, complete, late` });
            continue;
          }
          status = normalized;
        }

        // 6. Validate description (optional, convert to string if present)
        let description: string | undefined = undefined;
        if (r['description']) {
          const descVal = r['description'];
          if (typeof descVal === 'number') {
            description = descVal.toString();
          } else if (typeof descVal === 'string') {
            description = descVal.trim() || undefined;
          } else {
            description = String(descVal);
          }
          
          // Validate description length (max 500 characters)
          if (description && description.length > 500) {
            errors.push('Description is too long (max 500 characters)');
            rowErrors.push({ rowIndex: taskIndex, message: `Task ${taskIndex}: Description is too long (max 500 characters)` });
            continue;
          }
        }

        // All validations passed - create task
        try {
          const taskPayload: Omit<Task, '_id'> = {
            title,
            description,
            priority,
            status,
            end_time: endISO,
          };

          await taskService.createTask(taskPayload);
          createdCount += 1;
        } catch (e: any) {
          console.error('Task creation error:', e);
          
          const errorMsg = e?.message || e?.response?.data?.message || 'Unknown error';
          rowErrors.push({
            rowIndex: taskIndex,
            message: `Task ${taskIndex}: Failed to create task - ${errorMsg}`
          });
        }
      }

      setProcessing(false);
      setErrors(rowErrors);

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
              <p className="text-sm text-green-800">{createdCount} task{createdCount > 1 ? 's' : ''} imported successfully</p>
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

      onImported?.({ createdCount, errors: rowErrors });

      // Keep modal open always - user must manually close it
      // Modal stays open so user can review import results (success or errors)
    } catch (err: any) {
      console.error('Error in processImport:', err);
      setProcessing(false);
      toast.error('An error occurred while preparing import. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
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
                title={t('choose_excel_file')}
              />
            </div>

            <p className="text-xs text-gray-500">
              {t('template_columns')}
            </p>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-medium text-gray-700 mb-2">{t('template_sheet_name')}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {taskTemplateHeaders.map((key) => {
                  let displayText = t(`column_${key}` as any);
                  // Override specific column names
                  if (key === 'priority') displayText = 'Column Priority';
                  if (key === 'end_date') displayText = 'Column End Date';
                  
                  return (
                    <span key={key} className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow ring-1 ring-gray-200">
                      {displayText}
                    </span>
                  );
                })}
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

      <TaskLimitExceededUpgradeModal
        isOpen={showLimitExceededModal}
        onClose={() => {
          setShowLimitExceededModal(false);
          setTaskLimitError(null);
        }}
        attemptedCount={rows.length}
        tasksCreatedToday={tasksCreatedToday}
        errorDetails={taskLimitError?.details}
        upgradeInfo={taskLimitError?.upgrade}
      />
    </>
  );
};

export default TaskExcelImportModal;