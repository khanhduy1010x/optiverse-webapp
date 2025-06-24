import { useState } from 'react';
import * as taskEventService from '../../services/task-event.service';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { CreateTaskEventRequest } from '../../types/task-events/request/create-task-event.request';
import { UpdateTaskEventRequest } from '../../types/task-events/request/update-task-event.request';

export const useTaskEventOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateTaskEventRequest): Promise<TaskEvent | null> => {
    setLoading(true);
    setError(null);
    try {
      // For development, mock the creation
      // In production, uncomment the line below
      // return await taskEventService.createTaskEvent(data);
      console.log('Creating task event:', data);
      // Return a mock response
      return {
        _id: Math.random().toString(36).substring(2, 9),
        title: data.title,
        start_time: data.start_time,
        end_time: data.end_time,
        task_id: data.task_id,
        repeat_type: data.repeat_type || 'none',
        all_day: data.all_day || false,
        location: data.location,
        description: data.description
      };
    } catch (err: any) {
      setError(err.message || 'Failed to create task event');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: UpdateTaskEventRequest): Promise<TaskEvent | null> => {
    setLoading(true);
    setError(null);
    try {
      // For development, mock the update
      // In production, uncomment the line below
      // return await taskEventService.updateTaskEvent(id, data);
      console.log('Updating task event:', id, data);
      // Return a mock response
      return {
        _id: id,
        title: data.title || '',
        start_time: data.start_time || new Date(),
        end_time: data.end_time,
        task_id: data.task_id || '',
        repeat_type: data.repeat_type || 'none',
        all_day: data.all_day || false,
        location: data.location,
        description: data.description
      };
    } catch (err: any) {
      setError(err.message || 'Failed to update task event');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // For development, mock the deletion
      // In production, uncomment the line below
      // return await taskEventService.deleteTaskEvent(id);
      console.log('Deleting task event:', id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete task event');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTaskEvent: create,
    updateTaskEvent: update,
    deleteTaskEvent: remove,
    loading,
    error,
  };
}; 