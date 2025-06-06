import api from './api.service';
import { Task } from './task.service';

// Define ApiResponse interface for type safety
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// TaskTag relation interface
interface TaskTagRelation {
  _id: string;
  task: Task;
  tag: Tag;
}

// Tag interface definition
export interface Tag {
  _id: string;
  name: string;
  color: string;
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  taskTagId?: string; // ID of the task-tag relation (for deletion)
  tasks?: TaskTagRelation[]; // Virtual field for tasks
}

// Fetch all tags for the current user
export const fetchAllUserTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get<ApiResponse<Tag[]>>('/productivity/tag/all');
    console.log('Tags response:', response.data);
    
    // Normalize data to ensure consistent field names
    if (response.data && response.data.data) {
      const tags = Array.isArray(response.data.data) ? response.data.data : [];
      return tags.map(tag => ({
        ...tag,
        createdAt: tag.createdAt || tag.created_at,
        updatedAt: tag.updatedAt || tag.updated_at
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

// Create a new tag
export const createTag = async (tagData: Omit<Tag, '_id' | 'user_id'>): Promise<Tag> => {
  try {
    const response = await api.post<ApiResponse<{ tag: Tag }>>('/productivity/tag', tagData);
    if (response.data && response.data.data && response.data.data.tag) {
      const tag = response.data.data.tag;
      return {
        ...tag,
        createdAt: tag.createdAt || tag.created_at,
        updatedAt: tag.updatedAt || tag.updated_at
      };
    }
    throw new Error('Failed to create tag');
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

// Delete a tag
export const deleteTag = async (tagId: string): Promise<void> => {
  try {
    await api.delete(`/productivity/tag/${tagId}`);
  } catch (error) {
    console.error(`Error deleting tag ${tagId}:`, error);
    throw error;
  }
};

// Create a task-tag association
export const createTaskTag = async (taskId: string, tagId: string) => {
  try {
    const response = await api.post<ApiResponse<{ taskTag: TaskTagRelation }>>('/productivity/task-tag', {
      task_id: taskId,
      tag_id: tagId
    });
    
    if (response.data && response.data.data && response.data.data.taskTag) {
      return response.data.data.taskTag;
    }
    throw new Error('Failed to associate tag with task');
  } catch (error) {
    console.error(`Error associating tag ${tagId} with task ${taskId}:`, error);
    throw error;
  }
};

// Delete a task-tag association
export const deleteTaskTag = async (taskTagId: string): Promise<void> => {
  try {
    await api.delete(`/productivity/task-tag/${taskTagId}`);
  } catch (error) {
    console.error(`Error deleting task-tag association ${taskTagId}:`, error);
    throw error;
  }
};

// Fetch tasks by tag ID
export const fetchTasksByTagId = async (tagId: string): Promise<Task[]> => {
  try {
    // Get tag details which should include the tasks virtual field
    const response = await api.get<ApiResponse<{ tag: Tag }>>(`/productivity/tag/${tagId}`);
    if (response.data && response.data.data && response.data.data.tag && response.data.data.tag.tasks) {
      const tasks = response.data.data.tag.tasks;
      
      // Map the tasks to a more usable format
      return tasks
        .map((taskRelation: TaskTagRelation) => {
          if (taskRelation.task) {
            return {
              ...taskRelation.task,
              createdAt: taskRelation.task.createdAt || taskRelation.task.created_at,
              updatedAt: taskRelation.task.updatedAt || taskRelation.task.updated_at,
              taskTagId: taskRelation._id // Store the task-tag relation ID
            } as Task;
          }
          return null;
        })
        .filter((task): task is Task => task !== null);
    }
    return [];
  } catch (error) {
    console.error(`Error fetching tasks for tag ${tagId}:`, error);
    return [];
  }
};

// Fetch tasks by multiple tag IDs
export const fetchTasksByMultipleTags = async (tagIds: string[]): Promise<Task[]> => {
  try {
    const response = await api.post<ApiResponse<Task[]>>('/productivity/task/filter-by-tags', { tagIds });
    if (response.data && response.data.data) {
      const tasks = Array.isArray(response.data.data) ? response.data.data : [];
      return tasks.map((task: Task) => ({
        ...task,
        createdAt: task.createdAt || task.created_at,
        updatedAt: task.updatedAt || task.updated_at
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching tasks by multiple tags:', error);
    return [];
  }
}; 