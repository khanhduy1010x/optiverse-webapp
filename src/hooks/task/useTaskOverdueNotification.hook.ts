 import { useEffect, useState } from 'react';
import { Task } from '../../types/task/response/task.response';
import { TaskEvent } from '../../types/task-events/task-events.types';
import notificationService from '../../services/notification.service';
import taskService from '../../services/task.service';
import { taskEventService } from '../../services/task-event.service';

export const useTaskOverdueNotification = (tasks: Task[], taskEvents: TaskEvent[] = []) => {
  const [checkedTaskIds, setCheckedTaskIds] = useState<Record<string, boolean>>({});
  const [checkedEventIds, setCheckedEventIds] = useState<Record<string, boolean>>({});

  // Check for overdue tasks and send notifications
  const checkOverdueTasks = async () => {
    const now = new Date();
    
    // Check regular tasks
    for (const task of tasks) {
      // Skip tasks that are already completed, already marked as overdue, or already checked
      if (task.status === 'completed' || task.status === 'overdue' || checkedTaskIds[task._id]) {
        continue;
      }

      // Check if task has deadline and is overdue
      if (task.end_time) {
        const endTime = new Date(task.end_time);
        
        if (endTime < now) {
          console.log(`Task "${task.title}" is overdue!`);
          
          try {
            // Update task status to overdue
            await taskService.updateTask(task._id, { status: 'overdue' });
            
            // Send notification
            await notificationService.sendTaskOverdueNotification(task._id, task.title);
            
            // Mark task as checked
            setCheckedTaskIds(prev => ({
              ...prev,
              [task._id]: true
            }));
          } catch (error) {
            console.error(`Error handling overdue task ${task._id}:`, error);
          }
        }
      }
    }
  };

  // Check for overdue task events and send notifications
  const checkOverdueTaskEvents = async () => {
    const now = new Date();
    
    for (const event of taskEvents) {
      // Skip events that are already checked
      if (checkedEventIds[event._id]) {
        continue;
      }

      // Check if event has end time and is overdue
      if (event.end_time) {
        const endTime = new Date(event.end_time);
        
        if (endTime < now) {
          console.log(`Task Event "${event.title}" is overdue!`);
          
          try {
            // Get the associated task
            if (event.task_id) {
              const task = tasks.find(t => t._id === event.task_id);
              
              if (task && task.status !== 'completed' && task.status !== 'overdue') {
                // Update task status to overdue
                await taskService.updateTask(event.task_id, { status: 'overdue' });
                
                // Send notification with event information
                await notificationService.sendTaskOverdueNotification(
                  event.task_id, 
                  `${task.title} (Event: ${event.title})`
                );
              }
            }
            
            // Mark event as checked
            setCheckedEventIds(prev => ({
              ...prev,
              [event._id]: true
            }));
          } catch (error) {
            console.error(`Error handling overdue task event ${event._id}:`, error);
          }
        }
      }
    }
  };

  // Combined check function for both tasks and events
  const checkAllOverdue = async () => {
    await checkOverdueTasks();
    await checkOverdueTaskEvents();
  };

  // Check for overdue items when the component mounts and periodically
  useEffect(() => {
    // Initial check
    checkAllOverdue();
    
    // Set up interval for periodic checking (every minute)
    const intervalId = setInterval(() => {
      checkAllOverdue();
    }, 60000); // 60000ms = 1 minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [tasks, taskEvents]);

  // Reset checked lists when tasks or events change
  useEffect(() => {
    setCheckedTaskIds({});
  }, [tasks.length]);

  useEffect(() => {
    setCheckedEventIds({});
  }, [taskEvents.length]);

  return {
    checkOverdueTasks,
    checkOverdueTaskEvents,
    checkAllOverdue
  };
}; 