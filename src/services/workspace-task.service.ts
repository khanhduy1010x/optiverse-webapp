import api from './api.service';
import { ApiResponse } from '../types/api/api.interface';
import {
  WorkspaceTask,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '../types/workspace-task/workspace-task.types';

const BASE_URL = 'productivity/workspace';

class WorkspaceTaskServiceClass {
  // ========== Task CRUD ==========
  async createTask(
    workspaceId: string,
    createTaskDto: CreateTaskRequest,
  ): Promise<WorkspaceTask> {
    try {
      console.log('[Service] Creating task:', { workspaceId, dto: createTaskDto });
      const response = await api.post<ApiResponse<WorkspaceTask>>(
        `${BASE_URL}/${workspaceId}/task`,
        createTaskDto,
      );
      console.log('[Service] Task created successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('[Service] Failed to create task:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  async getTasksByWorkspace(workspaceId: string): Promise<WorkspaceTask[]> {
    try {
      console.log('[Service] getTasksByWorkspace called with workspaceId:', workspaceId);
      const response = await api.get<ApiResponse<WorkspaceTask[]>>(
        `${BASE_URL}/${workspaceId}/task`,
      );
      console.log('[Service] getTasksByWorkspace response:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('[Service] getTasksByWorkspace error:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  async getTasksByStatus(
    workspaceId: string,
    status: string,
  ): Promise<WorkspaceTask[]> {
    try {
      const response = await api.get<ApiResponse<WorkspaceTask[]>>(
        `${BASE_URL}/${workspaceId}/task/status/${status}`,
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to get tasks by status:', error);
      throw error;
    }
  }

  async getTaskById(workspaceId: string, taskId: string): Promise<WorkspaceTask> {
    try {
      const response = await api.get<ApiResponse<WorkspaceTask>>(
        `${BASE_URL}/${workspaceId}/task/${taskId}`,
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to get task:', error);
      throw error;
    }
  }

  async updateTask(
    workspaceId: string,
    taskId: string,
    updateTaskDto: UpdateTaskRequest,
  ): Promise<WorkspaceTask> {
    try {
      const response = await api.put<ApiResponse<WorkspaceTask>>(
        `${BASE_URL}/${workspaceId}/task/${taskId}`,
        updateTaskDto,
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }

  async deleteTask(workspaceId: string, taskId: string): Promise<void> {
    try {
      await api.delete(`${BASE_URL}/${workspaceId}/task/${taskId}`);
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }

  async assignTask(
    workspaceId: string,
    taskId: string,
    userId?: string,
  ): Promise<WorkspaceTask> {
    try {
      const response = await api.post<ApiResponse<WorkspaceTask>>(
        `${BASE_URL}/${workspaceId}/task/${taskId}/assign`,
        { userId },
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to assign task:', error);
      throw error;
    }
  }

  async updateTaskStatus(
    workspaceId: string,
    taskId: string,
    status: string,
  ): Promise<WorkspaceTask> {
    try {
      const response = await api.put<ApiResponse<WorkspaceTask>>(
        `${BASE_URL}/${workspaceId}/task/${taskId}/status`,
        { status },
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      throw error;
    }
  }
}

export default new WorkspaceTaskServiceClass();
