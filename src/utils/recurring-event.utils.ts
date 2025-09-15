import { TaskEvent } from '../types/task-events/task-events.types';

/**
 * Utility functions for handling recurring events
 */

/**
 * Check if an event is a recurring event
 */
export const isRecurringEvent = (event: TaskEvent): boolean => {
  return !!(event.repeat_type && event.repeat_type !== 'none');
};

/**
 * Check if an event is a recurring instance (virtual event)
 */
export const isRecurringInstance = (event: TaskEvent): boolean => {
  return event._id?.includes('::recurrence::') || (event as any).isRecurrence || false;
};