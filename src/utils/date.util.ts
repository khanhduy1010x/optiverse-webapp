// Utility functions for consistent date handling in Calendar

export const ensureDate = (value: unknown): Date => {
  if (!value) return new Date(NaN);
  if (value instanceof Date) return value;
  try {
    return new Date(value as any);
  } catch {
    return new Date(NaN);
  }
};

export const isSameLocalDay = (a: unknown, b: unknown): boolean => {
  const da = ensureDate(a);
  const db = ensureDate(b);
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return false;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

export const toLocalDateKey = (value: unknown): string => {
  const d = ensureDate(value);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};