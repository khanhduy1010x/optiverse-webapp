import { useState } from 'react';
import { taskEventService } from '../../services/task-event.service';
import { CreateTaskEventRequest } from '../../types/task-events/request/create-task-event.request';
import { UpdateTaskEventRequest } from '../../types/task-events/request/update-task-event.request';
import { TaskEvent, RepeatType, RepeatEndType } from '../../types/task-events/task-events.types';
import { useTaskEventList } from './useTaskEventList.hook';
import notificationService from '../../services/notification.service';
// Removed taskService dependency since TaskEvent no longer links to Task via task_id
import { useAppSelector } from '../../store/hooks';

export const useTaskEventOperations = (onEventCreated?: () => void, onEventUpdated?: () => void) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const userId = useAppSelector(state => state.auth.user?._id) || '';
  
  // Để sử dụng các hàm từ useTaskEventList
  let addEventToList: ((event: TaskEvent) => void) | null = null;
  let removeEventFromList: ((eventId: string, deleteOption?: 'all' | 'this') => void) | null = null;
  let updateEventInList: ((eventId: string, event: TaskEvent) => void) | null = null;
  
  // Hàm này được gọi bởi các component để set các hàm từ useTaskEventList
  const setListOperations = (
    add: (event: TaskEvent) => void,
    remove: (eventId: string, deleteOption?: 'all' | 'this') => void,
    update: (eventId: string, event: TaskEvent) => void
  ) => {
    addEventToList = add;
    removeEventFromList = remove;
    updateEventInList = update;
  };

  // Check if a task event is overdue and send notification if needed
  const checkEventOverdue = async (event: TaskEvent): Promise<boolean> => {
    if (!event.end_time) return false;
    
    const now = new Date();
    const endTime = new Date(event.end_time);
    
    if (endTime < now) {
      console.log(`Task Event "${event.title}" is overdue!`);
      
      try {
        // Send event-only overdue notification (no task linkage)
        await notificationService.sendEventOverdueNotification(
          event._id,
          event.title || 'Untitled Event'
        );
        return true;
      } catch (error) {
        console.error(`Error handling overdue task event ${event._id}:`, error);
        return false;
      }
    }
    
    return false;
  };

  // No task_id provisioning needed anymore

  const createTaskEvent = async (data: CreateTaskEventRequest): Promise<TaskEvent | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure required fields
      if (!data.user_id || data.user_id.trim() === '') {
        data.user_id = userId;
      }

      console.log('Creating task event with data:', data);
      
      // Luôn gọi API thực tế, không sử dụng dữ liệu giả lập
      const response = await taskEventService.createTaskEvent(data);
      console.log('API response:', response);
      
      const createdEvent = response.data.data;
      
      if (createdEvent) {
        console.log('Event created successfully:', createdEvent);
        
        // Check if the event is already overdue
        await checkEventOverdue(createdEvent);
        
        // Only update local state if addEventToList is a real function (not an empty function)
        // This prevents duplicate events when the component that called this function
        // is also listening for API updates
        if (addEventToList && addEventToList.toString() !== '() => {}') {
          console.log('Adding event to local state via addEventToList');
          addEventToList(createdEvent);
        } else {
          console.log('Skipping local state update - empty or missing addEventToList function');
        }
        
        // Trigger refresh callback to fetch updated list
        if (onEventCreated) {
          console.log('Triggering refresh after event creation');
          onEventCreated();
        }
        
        return createdEvent;
      } else {
        console.error('Failed to create event, invalid response:', response);
        setError('Failed to create task event: Invalid response from server');
        return null;
      }
    } catch (err) {
      setError('Failed to create task event');
      console.error('Error creating task event:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskEvent = async (
    taskEventId: string, 
    data: UpdateTaskEventRequest
  ): Promise<TaskEvent | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Updating task event with data:', data);
      
      // Luôn gọi API thực tế, không sử dụng dữ liệu giả lập
      const response = await taskEventService.updateTaskEvent(taskEventId, data);
      console.log('API response:', response);
      
      const updatedEvent = response.data.data;
      
      if (updatedEvent) {
        console.log('Event updated successfully:', updatedEvent);
        
        // Check if the updated event is overdue
        await checkEventOverdue(updatedEvent);
        
        // Cập nhật state local nếu có
        if (updateEventInList && typeof updateEventInList === 'function') {
          console.log('Updating event in local state');
          updateEventInList(taskEventId, updatedEvent);
        } else {
          console.log('No updateEventInList function provided or it is not a function');
        }
        
        // Trigger refresh callback to fetch updated list
        if (onEventUpdated) {
          console.log('Triggering refresh after event update');
          onEventUpdated();
        }
        
        return updatedEvent;
      } else {
        console.error('Failed to update event, invalid response:', response);
        setError('Failed to update task event: Invalid response from server');
        return null;
      }
    } catch (err) {
      setError('Failed to update task event');
      console.error('Error updating task event:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTaskEvent = async (taskEventId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Deleting task event:', taskEventId);
      
      // Check if this is a recurring event instance (support both legacy and new patterns)
      const isRecurrenceInstance = taskEventId.includes('::recurrence::') || taskEventId.includes('-recurrence-');
      
      // If it's a recurring instance, we need to extract the original ID
      const originalId = taskEventId.includes('::recurrence::')
        ? taskEventId.split('::recurrence::')[0]
        : (taskEventId.includes('-recurrence-')
            ? taskEventId.split('-recurrence-')[0]
            : taskEventId);
      
      // For recurring instances, update parent event via list hook by adding exclusion_dates
      if (isRecurrenceInstance) {
        console.log('This is a recurring instance. Trigger list removal with option "this" to persist exclusion_dates.');
        if (removeEventFromList && typeof removeEventFromList === 'function') {
          removeEventFromList(taskEventId, 'this');
        } else {
          console.warn('removeEventFromList not set; recurring instance deletion may not persist.');
        }
        return true;
      }
      
      // For real events, call the API
      const response = await taskEventService.deleteTaskEvent(originalId);
      console.log('API response:', response);
      
      // Xóa sự kiện khỏi state local nếu có
      if (removeEventFromList && typeof removeEventFromList === 'function') {
        console.log('Removing event from local state (delete all)');
        removeEventFromList(originalId, 'all');
      } else {
        console.log('No removeEventFromList function provided or it is not a function');
      }
      
      return true;
    } catch (err) {
      setError('Failed to delete task event');
      console.error('Error deleting task event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTaskEvent,
    updateTaskEvent,
    deleteTaskEvent,
    checkEventOverdue,
    setListOperations,
    loading,
    error
  };
};