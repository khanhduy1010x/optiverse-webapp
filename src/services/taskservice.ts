import api from './api';

// Define ApiResponse interface for type safety
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Task interface definition
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
  user_id?: string;
}

// Fetch all tasks for the current user
export const fetchAllUserTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get<ApiResponse<{ listTask: Task[] }>>('/productivity/task/all');
    console.log('Task response:', response.data);
    return response.data.data?.listTask || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Fetch a specific task by ID
export const fetchTaskById = async (taskId: string): Promise<Task> => {
  try {
    const response = await api.get<ApiResponse<Task>>(`/productivity/task/${taskId}`);
    if (response.data && response.data.data) {
      const task = response.data.data;
      return {
        ...task,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    }
    throw new Error('Task not found');
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData: Omit<Task, '_id'>): Promise<Task> => {
  try {
    const response = await api.post<ApiResponse<Task>>('/productivity/task', taskData);
    if (response.data && response.data.data) {
      const task = response.data.data;
      return {
        ...task,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    }
    throw new Error('Failed to create task');
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update an existing task
export const updateTask = async (taskId: string, taskData: Partial<Task>) => {
  try {
    const response = await api.put<ApiResponse<Task>>(`/productivity/task/${taskId}`, taskData);
    if (response.data && response.data.data) {
      return response.data;
    }
    throw new Error('Failed to update task');
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await api.delete(`/productivity/task/${taskId}`);
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

// Get tags for a specific task
export const getTaskTags = async (taskId: string) => {
  try {
    // This endpoint will need to be implemented on the backend
    const response = await api.get<ApiResponse<any>>(`/productivity/task/${taskId}/tags`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching tags for task ${taskId}:`, error);
    return [];
  }
}; 