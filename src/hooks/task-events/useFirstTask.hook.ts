import { useState, useEffect } from 'react';
import taskService from '../../services/task.service';

export interface UseFirstTaskResult {
  taskId: string | null;
  loading: boolean;
  error: string | null;
}

export const useFirstTask = (): UseFirstTaskResult => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFirstTask = async () => {
      try {
        console.log('Fetching tasks from API...');
        setLoading(true);
        setError(null);
        
        const tasks = await taskService.fetchAllUserTasks();
        console.log('Tasks fetched:', tasks);
        
        if (tasks && tasks.length > 0) {
          console.log('Setting taskId to:', tasks[0]._id);
          setTaskId(tasks[0]._id);
        } else {
          console.log('No tasks found');
          setTaskId(null);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFirstTask();
  }, []);

  return { taskId, loading, error };
}; 