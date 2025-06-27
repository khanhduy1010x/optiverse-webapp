import React, { useEffect } from 'react';
import { Task } from '../../types/task/response/task.response';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { useTaskOverdueNotification } from '../../hooks/task/useTaskOverdueNotification.hook';

interface TaskOverdueNotifierProps {
  tasks: Task[];
  taskEvents: TaskEvent[];
}

/**
 * A component that silently checks for overdue tasks and events
 * and sends notifications when needed. This component doesn't render anything.
 */
export const TaskOverdueNotifier: React.FC<TaskOverdueNotifierProps> = ({ 
  tasks, 
  taskEvents 
}) => {
  // Use the overdue notification hook to check for overdue tasks and events
  const { checkAllOverdue } = useTaskOverdueNotification(tasks, taskEvents);
  
  // Run the check when the component mounts or when tasks/events change
  useEffect(() => {
    // Check immediately on mount or when tasks/events change
    checkAllOverdue();
    
    // Also set up a timer to check periodically
    const intervalId = setInterval(() => {
      checkAllOverdue();
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [tasks, taskEvents, checkAllOverdue]);

  // This component doesn't render anything
  return null;
}; 