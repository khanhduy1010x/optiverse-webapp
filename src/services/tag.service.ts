import { ApiResponse } from '../types/api/api.interface';
import { Tag, TaskTagRelation } from '../types/task/response/tag.response';
import { Task } from '../types/task/response/task.response';
import api from './api.service';

class TagService {
  // Fetch all tags for the current user
  async fetchAllUserTags(): Promise<Tag[]> {
    try {
      const response = await api.get<ApiResponse<Tag[]>>(
        '/productivity/tag/all'
      );
      console.log('Tags response:', response.data);

      // Normalize data to ensure consistent field names
      if (response.data && response.data.data) {
        const tags = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        return tags.map(tag => ({
          ...tag,
          createdAt: tag.createdAt || tag.created_at,
          updatedAt: tag.updatedAt || tag.updated_at,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }

  // Update an existing tag
  async updateTag(tagId: string, payload: Partial<Pick<Tag, 'name' | 'color'>>): Promise<Tag> {
    try {
      const response = await api.put<ApiResponse<{ tag: Tag }>>(
        `/productivity/tag/${tagId}`,
        payload
      );
      if (response.data && response.data.data && (response.data.data as any)) {
        const tag = (response.data.data as any).tag ?? (response.data.data as any);
        return {
          ...tag,
          createdAt: tag.createdAt || tag.created_at,
          updatedAt: tag.updatedAt || tag.updated_at,
        } as Tag;
      }
      throw new Error('Failed to update tag');
    } catch (error) {
      console.error(`Error updating tag ${tagId}:`, error);
      throw error;
    }
  }

  // Create a new tag
  async createTag(tagData: Omit<Tag, '_id' | 'user_id'>): Promise<Tag> {
    try {
      // Validate tag data before sending
      if (!tagData.name || !tagData.name.trim()) {
        throw new Error('Tag name is required');
      }

      // Clean and prepare data
      const cleanedData = {
        name: tagData.name.trim(),
        color: tagData.color || '#3B82F6',
      };

      console.log('Sending tag creation request:', cleanedData);

      const response = await api.post<ApiResponse<{ tag: Tag }>>(
        '/productivity/tag',
        cleanedData
      );

      console.log('Tag creation response:', response.data);

      if (response.data && response.data.data && response.data.data.tag) {
        const tag = response.data.data.tag;
        return {
          ...tag,
          createdAt: tag.createdAt || tag.created_at,
          updatedAt: tag.updatedAt || tag.updated_at,
        };
      }
      throw new Error('Failed to create tag');
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }

  // Delete a tag
  async deleteTag(tagId: string): Promise<void> {
    try {
      await api.delete(`/productivity/tag/${tagId}`);
    } catch (error) {
      console.error(`Error deleting tag ${tagId}:`, error);
      throw error;
    }
  }

  // Create a task-tag association
  async createTaskTag(taskId: string, tagId: string) {
    try {
      console.log(
        `Creating task-tag association: taskId=${taskId}, tagId=${tagId}`
      );

      const payload = {
        task_id: taskId,
        tag_id: tagId,
      };

      console.log('Task-tag request payload:', payload);

      const response = await api.post<
        ApiResponse<{ taskTag: TaskTagRelation }>
      >('/productivity/task-tag', payload);

      console.log('Task-tag creation response:', response.data);

      if (response.data && response.data.data && response.data.data.taskTag) {
        console.log('Task-tag created successfully');
        return response.data.data.taskTag;
      }

      console.error(
        'Failed to create task-tag: API response did not contain expected data'
      );
      throw new Error('Failed to associate tag with task');
    } catch (error) {
      console.error(
        `Error associating tag ${tagId} with task ${taskId}:`,
        error
      );
      throw error;
    }
  }

  // Delete a task-tag association
  async deleteTaskTag(taskTagId: string): Promise<void> {
    try {
      await api.delete(`/productivity/task-tag/${taskTagId}`);
    } catch (error) {
      console.error(`Error deleting task-tag association ${taskTagId}:`, error);
      throw error;
    }
  }

  // Fetch tasks by tag ID
  async fetchTasksByTagId(tagId: string): Promise<Task[]> {
    try {
      // Get tag details which should include the tasks virtual field
      const response = await api.get<ApiResponse<{ tag: Tag }>>(
        `/productivity/tag/${tagId}`
      );
      if (
        response.data &&
        response.data.data &&
        response.data.data.tag &&
        response.data.data.tag.tasks
      ) {
        const tasks = response.data.data.tag.tasks;

        // Map the tasks to a more usable format
        return tasks
          .map((taskRelation: TaskTagRelation) => {
            if (taskRelation.task) {
              return {
                ...taskRelation.task,
                createdAt:
                  taskRelation.task.createdAt || taskRelation.task.created_at,
                updatedAt:
                  taskRelation.task.updatedAt || taskRelation.task.updated_at,
                taskTagId: taskRelation._id, // Store the task-tag relation ID
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
  }

  // Fetch tasks by multiple tag IDs
  async fetchTasksByMultipleTags(tagIds: string[]): Promise<Task[]> {
    try {
      const response = await api.post<ApiResponse<Task[]>>(
        '/productivity/task/filter-by-tags',
        { tagIds }
      );
      if (response.data && response.data.data) {
        const tasks = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        return tasks.map((task: Task) => ({
          ...task,
          createdAt: task.createdAt || task.created_at,
          updatedAt: task.updatedAt || task.updated_at,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching tasks by multiple tags:', error);
      return [];
    }
  }
}

export default new TagService();
