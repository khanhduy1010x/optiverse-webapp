import { useEffect, useState } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import * as taskEventService from '../../services/task-event.service';

export const useTaskEventList = (taskId: string) => {
  const [taskEvents, setTaskEvents] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // For development, use mock data
      // In production, uncomment the line below
      // const data = await taskEventService.getTaskEvents(taskId);
      const data = taskEventService.getMockTaskEvents(taskId);
      setTaskEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch task events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskEvents();
    // eslint-disable-next-line
  }, [taskId]);

  return { taskEvents, loading, error, refreshTaskEvents: fetchTaskEvents };
}; 