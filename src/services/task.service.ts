import api from './api.service';
import { ApiResponse } from '../types/api/api.interface';
import { Task } from '../types/task/response/task.response';

class TaskService {
  // Fetch all tasks for the current user
  async fetchAllUserTasks(): Promise<Task[]> {
    try {
      const response = await api.get<ApiResponse<{ listTask: Task[] }>>(
        '/productivity/task/all'
      );
      console.log('Task response:', response.data);

      // Normalize the data to ensure consistent field names
      const tasks = response.data.data?.listTask || [];
      return tasks.map(task => ({
        ...task,
        createdAt: task.createdAt || task.created_at,
        updatedAt: task.updatedAt || task.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Fetch a specific task by ID
  async fetchTaskById(taskId: string): Promise<Task> {
    try {
      const response = await api.get<ApiResponse<{ task: Task }>>(
        `/productivity/task/${taskId}`
      );
      if (response.data && response.data.data && response.data.data.task) {
        const task = response.data.data.task;
        return {
          ...task,
          createdAt: task.createdAt || task.created_at,
          updatedAt: task.updatedAt || task.updated_at,
        };
      }
      throw new Error('Task not found');
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      throw error;
    }
  }

  // Create a new task
  async createTask(taskData: Omit<Task, '_id'>): Promise<Task> {
    try {
      const response = await api.post<ApiResponse<{ task: Task }>>(
        '/productivity/task',
        taskData
      );
      if (response.data && response.data.data && response.data.data.task) {
        const task = response.data.data.task;
        return {
          ...task,
          createdAt: task.createdAt || task.created_at,
          updatedAt: task.updatedAt || task.updated_at,
        };
      }
      throw new Error('Failed to create task');
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update an existing task
  async updateTask(taskId: string, taskData: Partial<Task>) {
    try {
      console.log('Updating task with data:', taskData);
      const response = await api.put<ApiResponse<{ task: Task }>>(
        `/productivity/task/${taskId}`,
        taskData
      );
      console.log('Update response:', response.data);
      if (response.data && response.data.data) {
        return response.data;
      }
      throw new Error('Failed to update task');
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    try {
      await api.delete(`/productivity/task/${taskId}`);
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  }

  // Get tags for a specific task
  async getTaskTags(taskId: string) {
    try {
      // Get task details which should include the tags virtual field
      const response = await api.get<ApiResponse<{ task: Task }>>(
        `/productivity/task/${taskId}`
      );
      console.log('API getTaskTags response:', response.data);
      if (response.data && response.data.data && response.data.data.task) {
        const task = response.data.data.task;
        console.log('Task object in getTaskTags:', task);
        // Extract tags from the virtual field
        if (task.tags && Array.isArray(task.tags)) {
          // Map the tags to a more usable format
          return task.tags
            .map(tagRelation => {
              if (tagRelation.tag) {
                return {
                  _id: tagRelation.tag._id,
                  name: tagRelation.tag.name,
                  color: tagRelation.tag.color,
                  taskTagId: tagRelation._id, // Store the task-tag relation ID for deletion
                };
              }
              return null;
            })
            .filter(tag => tag !== null);
        } else {
          console.warn('No tags array found in task:', task);
        }
      } else {
        console.warn('No task found in getTaskTags response:', response.data);
      }
      return [];
    } catch (error) {
      console.error(`Error fetching tags for task ${taskId}:`, error);
      return [];
    }
  }

  // Filter tasks by multiple tags
  async filterTasksByTags(tagIds: string[]): Promise<Task[]> {
    try {
      const response = await api.post<ApiResponse<Task[]>>(
        '/productivity/task/filter-by-tags',
        { tagIds }
      );
      if (response.data && response.data.data) {
        const tasks = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        return tasks.map(task => ({
          ...task,
          createdAt: task.createdAt || task.created_at,
          updatedAt: task.updatedAt || task.updated_at,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error filtering tasks by tags:', error);
      return [];
    }
  }

  // Create a task-tag relation
  async createTaskTag(taskId: string, tagId: string) {
    try {
      const response = await api.post<ApiResponse<{ taskTag: any }>>(
        '/productivity/task-tag',
        { taskId, tagId }
      );
      if (response.data && response.data.data) {
        return response.data.data.taskTag;
      }
      throw new Error('Failed to create task-tag relation');
    } catch (error) {
      console.error('Error creating task-tag relation:', error);
      throw error;
    }
  }

  // Delete a task-tag relation
  async deleteTaskTag(taskTagId: string) {
    try {
      await api.delete(`/productivity/task-tag/${taskTagId}`);
    } catch (error) {
      console.error(`Error deleting task-tag relation ${taskTagId}:`, error);
      throw error;
    }
  }
}

export default new TaskService();
