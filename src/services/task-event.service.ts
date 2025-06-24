import apiService from './api.service';
import { CreateTaskEventRequest } from '../types/task-events/request/create-task-event.request';
import { UpdateTaskEventRequest } from '../types/task-events/request/update-task-event.request';
import { TaskEvent } from '../types/task-events/task-events.types';

const BASE_URL = '/task-events';

export const getTaskEvents = async (taskId: string): Promise<TaskEvent[]> => {
  try {
    const response = await apiService.get(`${BASE_URL}/task/${taskId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching task events:', error);
    throw error;
  }
};

export const getTaskEvent = async (id: string): Promise<TaskEvent> => {
  try {
    const response = await apiService.get(`${BASE_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching task event:', error);
    throw error;
  }
};

export const createTaskEvent = async (data: CreateTaskEventRequest): Promise<TaskEvent> => {
  try {
    const response = await apiService.post(BASE_URL, data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating task event:', error);
    throw error;
  }
};

export const updateTaskEvent = async (id: string, data: UpdateTaskEventRequest): Promise<TaskEvent> => {
  try {
    const response = await apiService.put(`${BASE_URL}/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating task event:', error);
    throw error;
  }
};

export const deleteTaskEvent = async (id: string): Promise<boolean> => {
  try {
    await apiService.delete(`${BASE_URL}/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting task event:', error);
    throw error;
  }
};

// Mock data for development
export const getMockTaskEvents = (taskId: string): TaskEvent[] => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  return [
    {
      _id: '1',
      title: 'Team Meeting',
      start_time: new Date(today.setHours(10, 0, 0, 0)),
      end_time: new Date(today.setHours(11, 0, 0, 0)),
      task_id: taskId,
      repeat_type: 'weekly'
    },
    {
      _id: '2',
      title: 'Project Review',
      start_time: new Date(tomorrow.setHours(14, 0, 0, 0)),
      end_time: new Date(tomorrow.setHours(15, 30, 0, 0)),
      task_id: taskId,
      repeat_type: 'none'
    }
  ];
};

export default {
  getTaskEvents,
  getTaskEvent,
  createTaskEvent,
  updateTaskEvent,
  deleteTaskEvent,
  getMockTaskEvents
}; 