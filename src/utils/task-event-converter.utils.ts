import { TaskEvent } from '../types/task-events/task-events.types';
import { Task } from '../types/task/response/task.response';

/**
 * Chuyển đổi TaskEvent thành Task để sử dụng với TaskDetail component
 * @param taskEvent - TaskEvent object từ calendar
 * @returns Task object tương thích với TaskDetail
 */
export const convertTaskEventToTask = (taskEvent: TaskEvent): Task => {
  return {
    _id: taskEvent._id,
    title: taskEvent.title,
    description: taskEvent.description || '',
    status: 'pending' as const, // TaskEvent không có status, mặc định là pending
    priority: 'medium' as const, // TaskEvent không có priority, mặc định là medium
    start_time: taskEvent.start_time,
    end_time: taskEvent.end_time,
    user_id: taskEvent.user_id,
    createdAt: taskEvent.createdAt ? (typeof taskEvent.createdAt === 'string' ? taskEvent.createdAt : taskEvent.createdAt.toISOString()) : undefined,
    updatedAt: taskEvent.updatedAt ? (typeof taskEvent.updatedAt === 'string' ? taskEvent.updatedAt : taskEvent.updatedAt.toISOString()) : undefined,
    tags: [] // TaskEvent không có tags, mặc định là array rỗng
  };
};

/**
 * Chuyển đổi Task thành TaskEvent để cập nhật lại calendar
 * @param task - Task object từ TaskDetail
 * @param originalTaskEvent - TaskEvent gốc để giữ lại các thuộc tính calendar-specific
 * @returns TaskEvent object đã được cập nhật
 */
export const convertTaskToTaskEvent = (task: Task, originalTaskEvent: TaskEvent): TaskEvent => {
  return {
    ...originalTaskEvent,
    _id: task._id,
    title: task.title,
    description: task.description,
    start_time: task.start_time || originalTaskEvent.start_time,
    end_time: task.end_time || originalTaskEvent.end_time,
    user_id: task.user_id || originalTaskEvent.user_id,
    updatedAt: new Date()
  };
};