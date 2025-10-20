import { useEffect, useMemo, useState } from 'react';
import taskService from '../../services/task.service';
import type { Task } from '../../types/task/response/task.response';

export interface UseTaskDeadlineMarkersParams {
  startDate: Date;
  endDate: Date;
}

export interface UseTaskDeadlineMarkersResult {
  deadlines: Task[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetch tasks and expose those with deadlines (end_time) within a given date range.
 * Excludes tasks with status 'completed' to focus on actionable deadlines.
 */
export const useTaskDeadlineMarkers = (
  { startDate, endDate }: UseTaskDeadlineMarkersParams
): UseTaskDeadlineMarkersResult => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const tasks = await taskService.fetchAllUserTasks();
        if (mounted) setAllTasks(tasks);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Failed to fetch tasks');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTasks();
    return () => { mounted = false; };
  }, [startDate, endDate]);

  const deadlines = useMemo(() => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return allTasks.filter(t => {
        if (t.status === 'completed') return false;
        if (!t.end_time) return false;
        const d = t.end_time instanceof Date ? t.end_time : new Date(t.end_time);
        if (isNaN(d.getTime())) return false;
        return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
      });
    } catch (e) {
      return [];
    }
  }, [allTasks, startDate, endDate]);

  return { deadlines, loading, error };
};