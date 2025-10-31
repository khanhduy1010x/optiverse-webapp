import { useEffect, useMemo, useState } from 'react';
import taskService from '../../services/task.service';
import { Task } from '../../types/task/response/task.response';
import { TimePeriod, PeriodStatistics, ChartDataPoint } from '../../types/task/taskStatistic.types';

export interface TaskStatisticData {
  tasks: Task[];
  loading: boolean;
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
  percentCompleted: number;
  weekByDay: number[]; // index 0=Sun ... 6=Sat
  period: TimePeriod;
  setPeriod: (period: TimePeriod) => void;
  periodStatistics: PeriodStatistics;
  chartData: ChartDataPoint[];
}

const getDateRange = (period: TimePeriod): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'day': {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'week': {
      const current = new Date();
      const first = current.getDate() - current.getDay();
      start.setDate(first);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'month': {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'year': {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
  }

  return { start, end };
};

const isDateInRange = (date: Date | string | undefined, start: Date, end: Date): boolean => {
  if (!date) return false;
  const d = new Date(date);
  return d >= start && d <= end;
};

const generateChartData = (tasks: Task[], period: TimePeriod): ChartDataPoint[] => {
  const { start, end } = getDateRange(period);
  const filteredTasks = tasks.filter(t => 
    isDateInRange(t.end_time, start, end) || isDateInRange(t.createdAt, start, end)
  );

  if (period === 'day') {
    // Hours in a day
    const data: ChartDataPoint[] = Array(24)
      .fill(null)
      .map((_, hour) => ({
        label: `${hour}:00`,
        completed: 0,
        pending: 0,
        overdue: 0,
      }));

    filteredTasks.forEach(t => {
      if (t.end_time) {
        const d = new Date(t.end_time);
        const hour = d.getHours();
        if (t.status === 'completed') data[hour].completed++;
        else if (t.status === 'pending') data[hour].pending++;
        else if (t.status === 'overdue') data[hour].overdue++;
      }
    });

    return data;
  }

  if (period === 'week') {
    // Days of week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data: ChartDataPoint[] = days.map(day => ({
      label: day,
      completed: 0,
      pending: 0,
      overdue: 0,
    }));

    filteredTasks.forEach(t => {
      if (t.end_time) {
        const d = new Date(t.end_time);
        const dayIndex = d.getDay();
        if (t.status === 'completed') data[dayIndex].completed++;
        else if (t.status === 'pending') data[dayIndex].pending++;
        else if (t.status === 'overdue') data[dayIndex].overdue++;
      }
    });

    return data;
  }

  if (period === 'month') {
    // Days of month
    const daysInMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    const data: ChartDataPoint[] = Array(daysInMonth)
      .fill(null)
      .map((_, day) => ({
        label: `${day + 1}`,
        completed: 0,
        pending: 0,
        overdue: 0,
      }));

    filteredTasks.forEach(t => {
      if (t.end_time) {
        const d = new Date(t.end_time);
        const dayOfMonth = d.getDate() - 1;
        if (dayOfMonth >= 0 && dayOfMonth < data.length) {
          if (t.status === 'completed') data[dayOfMonth].completed++;
          else if (t.status === 'pending') data[dayOfMonth].pending++;
          else if (t.status === 'overdue') data[dayOfMonth].overdue++;
        }
      }
    });

    return data;
  }

  // Year - months
  const data: ChartDataPoint[] = Array(12)
    .fill(null)
    .map((_, month) => ({
      label: new Date(2024, month, 1).toLocaleString('en-US', { month: 'short' }),
      completed: 0,
      pending: 0,
      overdue: 0,
    }));

  filteredTasks.forEach(t => {
    if (t.end_time) {
      const d = new Date(t.end_time);
      const month = d.getMonth();
      if (t.status === 'completed') data[month].completed++;
      else if (t.status === 'pending') data[month].pending++;
      else if (t.status === 'overdue') data[month].overdue++;
    }
  });

  return data;
};

export const useTaskStatistic = (): TaskStatisticData => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('week');

  useEffect(() => {
    const fetch = async () => {
      try {
        const list = await taskService.fetchAllUserTasks();
        setTasks(list);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const { completedCount, pendingCount, overdueCount, percentCompleted, weekByDay, periodStatistics, chartData } = useMemo(() => {
    // Overall stats (all time)
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    const total = tasks.length || 1;

    const chart = Array(7).fill(0);
    tasks.forEach(t => {
      if (t.status === 'completed' && t.end_time) {
        const d = new Date(t.end_time as string).getDay();
        chart[d]++;
      }
    });

    // Period-specific stats
    const { start, end } = getDateRange(period);
    const periodTasks = tasks.filter(t => 
      isDateInRange(t.end_time, start, end) || isDateInRange(t.createdAt, start, end)
    );

    const periodCompleted = periodTasks.filter(t => t.status === 'completed').length;
    const periodPending = periodTasks.filter(t => t.status === 'pending').length;
    const periodOverdue = periodTasks.filter(t => t.status === 'overdue').length;
    const periodTotal = periodTasks.length || 1;

    return {
      completedCount: completed,
      pendingCount: pending,
      overdueCount: overdue,
      percentCompleted: Math.round((completed / total) * 100),
      weekByDay: chart,
      periodStatistics: {
        completed: periodCompleted,
        pending: periodPending,
        overdue: periodOverdue,
        total: periodTotal,
        percentCompleted: Math.round((periodCompleted / periodTotal) * 100),
      },
      chartData: generateChartData(tasks, period),
    };
  }, [tasks, period]);

  return {
    tasks,
    loading,
    completedCount,
    pendingCount,
    overdueCount,
    percentCompleted,
    weekByDay,
    period,
    setPeriod,
    periodStatistics,
    chartData,
  };
};

export default useTaskStatistic;