import { useState } from 'react';
import { taskEventService } from '../../services/task-event.service';
import { CreateTaskEventRequest } from '../../types/task-events/request/create-task-event.request';
import { UpdateTaskEventRequest } from '../../types/task-events/request/update-task-event.request';
import { TaskEvent } from '../../types/task-events/task-events.types';

export const useTaskEventOperations = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createTaskEvent = async (data: CreateTaskEventRequest): Promise<TaskEvent | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await taskEventService.createTaskEvent(data);
      return response.data.data;
    } catch (err) {
      setError('Failed to create task event');
      console.error('Error creating task event:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskEvent = async (
    taskEventId: string, 
    data: UpdateTaskEventRequest
  ): Promise<TaskEvent | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await taskEventService.updateTaskEvent(taskEventId, data);
      return response.data.data;
    } catch (err) {
      setError('Failed to update task event');
      console.error('Error updating task event:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTaskEvent = async (taskEventId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await taskEventService.deleteTaskEvent(taskEventId);
      return true;
    } catch (err) {
      setError('Failed to delete task event');
      console.error('Error deleting task event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTaskEvent,
    updateTaskEvent,
    deleteTaskEvent,
    loading,
    error
  };
}; 