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
}; 