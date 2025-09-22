import { useEffect, useMemo, useState } from 'react';
import taskService from '../../services/task.service';
import { Task } from '../../types/task/response/task.response';

export interface TaskStatisticData {
  tasks: Task[];
  loading: boolean;
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
  percentCompleted: number;
  weekByDay: number[]; // index 0=Sun ... 6=Sat
}

export const useTaskStatistic = (): TaskStatisticData => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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

  const { completedCount, pendingCount, overdueCount, percentCompleted, weekByDay } = useMemo(() => {
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

    return {
      completedCount: completed,
      pendingCount: pending,
      overdueCount: overdue,
      percentCompleted: Math.round((completed / total) * 100),
      weekByDay: chart,
    };
  }, [tasks]);

  return {
    tasks,
    loading,
    completedCount,
    pendingCount,
    overdueCount,
    percentCompleted,
    weekByDay,
  };
};

export default useTaskStatistic;