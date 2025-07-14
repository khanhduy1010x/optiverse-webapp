import { useState, useEffect, useCallback } from 'react';
import taskService from '../../services/task.service';

export interface UseFirstTaskResult {
  taskId: string | null;
  loading: boolean;
  error: string | null;
  refreshTask: () => void;
}

export const useFirstTask = (): UseFirstTaskResult => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const fetchFirstTask = useCallback(async () => {
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
  }, []);

  // Hàm để refresh lại task
  const refreshTask = useCallback(() => {
    console.log('Refreshing task data');
    // Thay vì chỉ tăng refreshKey, chúng ta sẽ gọi trực tiếp fetchFirstTask
    // để đảm bảo dữ liệu được làm mới ngay lập tức
    fetchFirstTask();
  }, [fetchFirstTask]);

  useEffect(() => {
    fetchFirstTask();
  }, [fetchFirstTask, refreshKey]);

  return { taskId, loading, error, refreshTask };
}; 