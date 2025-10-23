import api from './api.service';
import { ApiResponse } from '../types/api/api.interface';
import {
  WorkspaceTask,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
} from '../types/workspace-task/workspace-task.types';

const BASE_URL = 'productivity/workspace';

class WorkspaceTaskServiceClass {
  // ========== Task CRUD ==========
  async createTask(
    workspaceId: string,
    createTaskDto: CreateTaskRequest,
  ): Promise<WorkspaceTask> {
    try {
      const response = await api.post<ApiResponse<WorkspaceTask>>(
        `${BASE_URL}/${workspaceId}/task`,
        createTaskDto,
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  async getTasksByWorkspace(workspaceId: string): Promise<WorkspaceTask[]> {
    try {
      const response = await api.get<ApiResponse<WorkspaceTask[]>>(
        `${BASE_URL}/${workspaceId}/task`,
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to get tasks:', error);
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
    userId: string,
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

  // ========== Subtask Operations ==========
  async createSubtask(
    workspaceId: string,
    taskId: string,
    createSubtaskDto: CreateSubtaskRequest,
  ): Promise<WorkspaceTask> {
    try {
      const response = await api.post<ApiResponse<WorkspaceTask>>(
        `${BASE_URL}/${workspaceId}/task/${taskId}/subtask`,
        createSubtaskDto,
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create subtask:', error);
      throw error;
    }
  }

  async updateSubtask(
    workspaceId: string,
    taskId: string,
    subtaskId: string,
    updateSubtaskDto: UpdateSubtaskRequest,
  ): Promise<WorkspaceTask> {
    try {
      const response = await api.put<ApiResponse<WorkspaceTask>>(
        `${BASE_URL}/${workspaceId}/task/${taskId}/subtask/${subtaskId}`,
        updateSubtaskDto,
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to update subtask:', error);
      throw error;
    }
  }

  async deleteSubtask(
    workspaceId: string,
    taskId: string,
    subtaskId: string,
  ): Promise<void> {
    try {
      await api.delete(
        `${BASE_URL}/${workspaceId}/task/${taskId}/subtask/${subtaskId}`,
      );
    } catch (error: any) {
      console.error('Failed to delete subtask:', error);
      throw error;
    }
  }

  async updateSubtaskStatus(
    workspaceId: string,
    taskId: string,
    subtaskId: string,
    status: string,
  ): Promise<WorkspaceTask> {
    try {
      const response = await api.put<ApiResponse<WorkspaceTask>>(
        `${BASE_URL}/${workspaceId}/task/${taskId}/subtask/${subtaskId}/status`,
        { status },
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to update subtask status:', error);
      throw error;
    }
  }
}

export default new WorkspaceTaskServiceClass();
