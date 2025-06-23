import { TaskEvent } from '../task-events.types';

export interface TaskEventResponse {
  taskEvent: TaskEvent;
}
 
export interface TaskEventsResponse {
  taskEvents: TaskEvent[];
} 