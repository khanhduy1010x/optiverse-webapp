import api from './api.service';
import { TaskEvent } from '../types/task-events/task-events.types';
import { CreateTaskEventRequest } from '../types/task-events/request/create-task-event.request';
import { UpdateTaskEventRequest } from '../types/task-events/request/update-task-event.request';
import { ApiResponse } from '../types/api/api.interface';
import { validateTaskEvent } from '../utils/validate.util';

// Thay đổi BASE_URL để phù hợp với cấu trúc API của productivity service
const BASE_URL = '/productivity/task-event';

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  throw error;
};

// Helper function to validate task event data before API calls
const validateTaskEventData = (data: {
  title?: string;
  start_time: Date | string;
  end_time?: Date | string;
  description?: string;
}) => {
  const validation = validateTaskEvent({
    title: data.title || '',
    start_time: data.start_time,
    end_time: data.end_time,
    description: data.description
  });
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
};

export const taskEventService = {
  // Method mới để lấy events theo userId
  getTaskEventsByUserId: async () => {
    try {
      console.log(`🔍 Fetching task events for current user`);
      console.log(`📡 API endpoint: ${BASE_URL}/user`);
      
      const response = await api.get<ApiResponse<TaskEvent[]>>(`${BASE_URL}/user`);
      
      console.log(`✅ API Response received:`, response);
      console.log(`📊 Response data structure:`, response?.data);
      console.log(`📋 Events count:`, Array.isArray(response?.data?.data) ? response.data.data.length : 'Not an array');
      
      return response;
    } catch (error: any) {
      console.error(`❌ Error fetching task events for user:`, error);
      console.error(`🔍 Error details:`, {
        message: error?.message || 'Unknown error',
        status: error?.response?.status || 'No status',
        statusText: error?.response?.statusText || 'No status text',
        data: error?.response?.data || 'No data'
      });
      return { data: { status: 'error', data: [], message: 'Failed to fetch events' } };
    }
  },

  // Giữ lại method cũ để tương thích ngược (deprecated)
  getTaskEventsByTaskId: async (taskId: string) => {
    try {
      console.log(`🔍 Fetching task events for taskId: ${taskId} (deprecated - using user endpoint)`);
      console.log(`📡 API endpoint: ${BASE_URL}/user`);
      
      const response = await api.get<ApiResponse<TaskEvent[]>>(`${BASE_URL}/user`);
      
      console.log(`✅ API Response received:`, response);
      console.log(`📊 Response data structure:`, response?.data);
      console.log(`📋 Events count:`, Array.isArray(response?.data?.data) ? response.data.data.length : 'Not an array');
      
      return response;
    } catch (error: any) {
      console.error(`❌ Error fetching task events for task ${taskId}:`, error);
      console.error(`🔍 Error details:`, {
        message: error?.message || 'Unknown error',
        status: error?.response?.status || 'No status',
        statusText: error?.response?.statusText || 'No status text',
        data: error?.response?.data || 'No data'
      });
      return { data: { status: 'error', data: [], message: 'Failed to fetch events' } };
    }
  },
  
  createTaskEvent: async (data: CreateTaskEventRequest) => {
    try {
      // Validate data before sending to API
      validateTaskEventData({
        title: data.title,
        start_time: data.start_time,
        end_time: data.end_time,
        description: data.description
      });

      console.log('✅ Task event data validation passed');
      
      // Sửa endpoint để phù hợp với API backend
      return await api.post<ApiResponse<TaskEvent>>(`${BASE_URL}/create`, data);
    } catch (error) {
      console.error('❌ Task event creation failed:', error);
      handleApiError(error);
      throw error;
    }
  },
  
  updateTaskEvent: async (taskEventId: string, data: UpdateTaskEventRequest) => {
    try {
      // Only validate if we have the required fields for validation
      if (data.title && data.start_time) {
        validateTaskEventData({
          title: data.title,
          start_time: data.start_time,
          end_time: data.end_time,
          description: data.description
        });

        console.log('✅ Task event update data validation passed');
      }
      
      // Sửa endpoint để phù hợp với API backend
      return await api.put<ApiResponse<TaskEvent>>(`${BASE_URL}/update/${taskEventId}`, data);
    } catch (error) {
      console.error('❌ Task event update failed:', error);
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