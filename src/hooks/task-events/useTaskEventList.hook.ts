import { useState, useEffect } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { taskEventService } from '../../services/task-event.service';

// Mock data for development
const mockEvents: TaskEvent[] = [
  {
    _id: '1',
    task_id: 'mock-task-1',
    start_time: new Date(new Date().setHours(10, 0, 0, 0)),
    end_time: new Date(new Date().setHours(11, 0, 0, 0)),
    repeat_type: 'none'
  },
  {
    _id: '2',
    task_id: 'mock-task-1',
    start_time: new Date(new Date().setHours(14, 30, 0, 0)),
    end_time: new Date(new Date().setHours(15, 30, 0, 0)),
    repeat_type: 'daily',
    repeat_interval: 1
  },
  {
    _id: '3',
    task_id: 'mock-task-1',
    start_time: new Date(new Date().setDate(new Date().getDate() + 1)),
    end_time: new Date(new Date().setDate(new Date().getDate() + 1)),
    repeat_type: 'weekly',
    repeat_interval: 1
  }
];

export const useTaskEventList = (taskId: string) => {
  const [taskEvents, setTaskEvents] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  const fetchTaskEvents = async () => {
    // For demo/development, use mock data
    if (!taskId || process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        setTaskEvents(mockEvents);
        setLoading(false);
      }, 1000); // Simulate API delay
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await taskEventService.getTaskEventsByTaskId(taskId);
      setTaskEvents(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch task events');
      console.error('Error fetching task events:', err);
      // Fallback to mock data on error
      setTaskEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskEvents();
  }, [taskId]);

  return {
    taskEvents,
    loading,
    error,
    refreshTaskEvents: fetchTaskEvents
  };
}; 