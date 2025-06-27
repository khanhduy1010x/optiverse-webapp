import api from './api.service';
import { TaskEvent } from '../types/task-events/task-events.types';
import { CreateTaskEventRequest } from '../types/task-events/request/create-task-event.request';
import { UpdateTaskEventRequest } from '../types/task-events/request/update-task-event.request';
import { ApiResponse } from '../types/api/api.interface';

// Thay đổi BASE_URL để phù hợp với cấu trúc API của productivity service
const BASE_URL = '/productivity/task-event';

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  throw error;
};

export const taskEventService = {
  getTaskEventsByTaskId: async (taskId: string) => {
    try {
      // Endpoint chính xác theo backend
      return await api.get<ApiResponse<TaskEvent[]>>(`${BASE_URL}/task/${taskId}`);
    } catch (error) {
      console.error(`Error fetching task events for task ${taskId}:`, error);
      return { data: { status: 'error', data: [], message: 'Failed to fetch events' } };
    }
  },
  
  createTaskEvent: async (data: CreateTaskEventRequest) => {
    try {
      // Sửa endpoint để phù hợp với API backend
      return await api.post<ApiResponse<TaskEvent>>(`${BASE_URL}/create`, data);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  updateTaskEvent: async (taskEventId: string, data: UpdateTaskEventRequest) => {
    try {
      // Sửa endpoint để phù hợp với API backend
      return await api.put<ApiResponse<TaskEvent>>(`${BASE_URL}/update/${taskEventId}`, data);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  deleteTaskEvent: async (taskEventId: string) => {
    try {
      // Sửa endpoint để phù hợp với API backend
      return await api.delete<ApiResponse<void>>(`${BASE_URL}/delete/${taskEventId}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
}; 