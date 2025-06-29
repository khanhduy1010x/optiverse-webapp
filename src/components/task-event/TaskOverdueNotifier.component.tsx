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
  const { checkAllOverdue, forceCheckOverdue } = useTaskOverdueNotification(tasks, taskEvents);
  
  // Run the check when the component mounts or when tasks/events change
  useEffect(() => {
    console.log('TaskOverdueNotifier mounted or tasks/events changed');
    console.log(`Tasks count: ${tasks.length}, Events count: ${taskEvents.length}`);
    
    // Force check immediately on mount or when tasks/events change
    console.log('Running immediate force check for overdue tasks');
    setTimeout(() => {
      forceCheckOverdue();
    }, 500); // Small delay to ensure component is fully mounted
    
    // Also set up a timer to check periodically
    const intervalId = setInterval(() => {
      console.log('TaskOverdueNotifier running periodic check');
      checkAllOverdue();
    }, 30000); // Check every 30 seconds (reduced from 60 seconds)
    
    // Set up a more thorough check less frequently
    const thoroughCheckIntervalId = setInterval(() => {
      console.log('TaskOverdueNotifier running thorough check');
      forceCheckOverdue();
    }, 300000); // Force check every 5 minutes
    
    return () => {
      clearInterval(intervalId);
      clearInterval(thoroughCheckIntervalId);
      console.log('TaskOverdueNotifier unmounted, cleared intervals');
    };
  }, [tasks, taskEvents, checkAllOverdue, forceCheckOverdue]);

  // This component doesn't render anything
  return null;
};

// Export a function to manually force check for overdue tasks
// This can be called from anywhere in the application
let forceCheckFunction: (() => void) | null = null;

export const setForceCheckFunction = (checkFn: () => void) => {
  console.log('Setting force check function');
  forceCheckFunction = checkFn;
};

export const forceCheckForOverdueTasks = () => {
  console.log('Manual force check for overdue tasks requested');
  if (forceCheckFunction) {
    console.log('Executing force check function');
    forceCheckFunction();
    return true;
  } else {
    console.warn('Force check function not available yet');
    return false;
  }
}; 