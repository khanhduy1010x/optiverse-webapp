<<<<<<< HEAD
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
=======
import api from './api.service';
import { TaskEvent } from '../types/task-events/task-events.types';
import { CreateTaskEventRequest } from '../types/task-events/request/create-task-event.request';
import { UpdateTaskEventRequest } from '../types/task-events/request/update-task-event.request';
import { ApiResponse } from '../types/api/api.interface';

const BASE_URL = '/task-event';

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  throw error;
};

export const taskEventService = {
  getTaskEventsByTaskId: async (taskId: string) => {
    try {
      return await api.get<ApiResponse<TaskEvent[]>>(`${BASE_URL}/task/${taskId}`);
    } catch (error) {
      handleApiError(error);
      // This line is needed for TypeScript, but won't be reached due to throw in handleApiError
      throw error;
    }
  },
  
  createTaskEvent: async (data: CreateTaskEventRequest) => {
    try {
      return await api.post<ApiResponse<TaskEvent>>(`${BASE_URL}/create`, data);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  updateTaskEvent: async (taskEventId: string, data: UpdateTaskEventRequest) => {
    try {
      return await api.put<ApiResponse<TaskEvent>>(`${BASE_URL}/update/${taskEventId}`, data);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  deleteTaskEvent: async (taskEventId: string) => {
    try {
      return await api.delete<ApiResponse<void>>(`${BASE_URL}/delete/${taskEventId}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
>>>>>>> aa93f60831703624ecd088c309bf01770d28c29b
}; 