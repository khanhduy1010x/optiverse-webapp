import { useEffect, useState, useRef, useCallback } from 'react';
import { Task } from '../../types/task/response/task.response';
import { TaskEvent } from '../../types/task-events/task-events.types';
import notificationService from '../../services/notification.service';
import taskService from '../../services/task.service';
import { isTaskNearDue, isTaskOverdue } from '../../utils/date.utils';

export const useTaskOverdueNotification = (
  tasks: Task[],
  taskEvents: TaskEvent[] = []
) => {
  const [checkedTaskIds, setCheckedTaskIds] = useState<Record<string, boolean>>(
    {}
  );
  const [checkedEventIds, setCheckedEventIds] = useState<
    Record<string, boolean>
  >({});
  const [nearDueNotifiedTaskIds, setNearDueNotifiedTaskIds] = useState<
    Record<string, boolean>
  >({});
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const processingTaskIds = useRef<Set<string>>(new Set()); // Track tasks currently being processed

  // Function to mark a task as overdue and show notification
  const markTaskAsOverdue = async (task: Task) => {
    // If this task is already being processed, skip to avoid duplicate processing
    if (processingTaskIds.current.has(task._id)) {
      console.log(
        `Task ${task._id} is already being processed, skipping duplicate request`
      );
      return;
    }

    // Mark task as being processed
    processingTaskIds.current.add(task._id);

    try {
      console.log(
        `Attempting to mark task "${task.title}" (${task._id}) as overdue`
      );
      console.log(`Task current status: ${task.status}`);
      console.log(`Task end_time: ${task.end_time}`);

      // Double check if task is already overdue or completed
      if (task.status === 'completed' || task.status === 'overdue') {
        console.log(
          `Task ${task._id} is already ${task.status}, skipping update`
        );
        processingTaskIds.current.delete(task._id);
        return;
      }

      // Update task status to overdue
      await taskService.updateTask(task._id, { status: 'overdue' });
      console.log(`API call to update task ${task._id} completed`);

      // Send notification to backend
      await notificationService.sendTaskOverdueNotification(
        task._id,
        task.title
      );
      console.log(`Notification sent to backend for task ${task._id}`);

      // Mark task as checked
      setCheckedTaskIds(prev => ({
        ...prev,
        [task._id]: true,
      }));
      console.log(`Task ${task._id} marked as checked in local state`);
    } catch (error) {
      console.error(`Error handling overdue task ${task._id}:`, error);
      // Try again after a short delay if there was an error
      setTimeout(() => {
        console.log(`Retrying to mark task ${task._id} as overdue after error`);
        // Remove from processing set before retrying
        processingTaskIds.current.delete(task._id);
        markTaskAsOverdue(task);
      }, 5000);
      return; // Return early to keep task in processing state until retry
    }

    // Remove from processing set when done
    processingTaskIds.current.delete(task._id);
  };

  // Function to notify when task is near due (75% time elapsed)
  const notifyTaskNearDue = async (task: Task) => {
    // If this task is already being processed or already notified, skip
    if (
      processingTaskIds.current.has(`near_due_${task._id}`) ||
      nearDueNotifiedTaskIds[task._id]
    ) {
      return;
    }

    // Mark task as being processed
    processingTaskIds.current.add(`near_due_${task._id}`);

    try {
      console.log(
        `Sending notification for task "${task.title}" (${task._id}) that is 75% through its timeframe`
      );

      // Double check if task is already completed or overdue
      if (task.status === 'completed' || task.status === 'overdue') {
        console.log(
          `Task ${task._id} is already ${task.status}, skipping near due notification`
        );
        processingTaskIds.current.delete(`near_due_${task._id}`);
        return;
      }

      // Send notification to backend
      await notificationService.sendTaskNearDueNotification(
        task._id,
        task.title
      );
      console.log(`Near due notification sent to backend for task ${task._id}`);

      // Mark task as notified for near due
      setNearDueNotifiedTaskIds(prev => ({
        ...prev,
        [task._id]: true,
      }));
    } catch (error) {
      console.error(
        `Error handling near due notification for task ${task._id}:`,
        error
      );
      // Try again after a short delay if there was an error
      setTimeout(() => {
        console.log(
          `Retrying to send near due notification for task ${task._id} after error`
        );
        // Remove from processing set before retrying
        processingTaskIds.current.delete(`near_due_${task._id}`);
        notifyTaskNearDue(task);
      }, 5000);
      return; // Return early to keep task in processing state until retry
    }

    // Remove from processing set when done
    processingTaskIds.current.delete(`near_due_${task._id}`);
  };

  // Function to mark a task event as overdue and show notification
  const markTaskEventAsOverdue = async (event: TaskEvent) => {
    // If this event is already being processed, skip
    if (processingTaskIds.current.has(`event_${event._id}`)) {
      console.log(
        `Event ${event._id} is already being processed, skipping duplicate request`
      );
      return;
    }

    // Mark event as being processed
    processingTaskIds.current.add(`event_${event._id}`);

    try {
      console.log(
        `Attempting to mark task event "${event.title}" (${event._id}) as overdue`
      );

      // Send event-only overdue notification (no task linkage)
      await notificationService.sendEventOverdueNotification(
        event._id,
        event.title || 'Untitled Event'
      );

      // Mark event as checked
      setCheckedEventIds(prev => ({
        ...prev,
        [event._id]: true,
      }));
      console.log(`Event ${event._id} marked as checked in local state`);
    } catch (error) {
      console.error(`Error handling overdue task event ${event._id}:`, error);
      // Try again after a short delay if there was an error
      setTimeout(() => {
        console.log(
          `Retrying to mark event ${event._id} as overdue after error`
        );
        // Remove from processing set before retrying
        processingTaskIds.current.delete(`event_${event._id}`);
        markTaskEventAsOverdue(event);
      }, 5000);
      return; // Return early to keep event in processing state until retry
    }

    // Remove from processing set when done
    processingTaskIds.current.delete(`event_${event._id}`);
  };

  // Schedule precise timeouts for tasks that will become overdue
  const scheduleTaskTimeouts = () => {
    // Clear any existing timeouts first
    Object.values(timeoutRefs.current).forEach(timeout =>
      clearTimeout(timeout)
    );
    timeoutRefs.current = {};
    console.log('Cleared all existing timeouts');

    const now = new Date();
    console.log(`Current time: ${now.toISOString()}`);
    console.log(`Total tasks to check: ${tasks.length}`);

    // Schedule timeouts for tasks
    tasks.forEach(task => {
      // Skip tasks that are already completed, already marked as overdue
      if (task.status === 'completed' || task.status === 'overdue') {
        console.log(
          `Skipping task "${task.title}" (${task._id}): status=${task.status}`
        );
        return;
      }

      // Check if task has start_time and end_time
      if (task.start_time && task.end_time) {
        const startTime = new Date(task.start_time);
        const endTime = new Date(task.end_time);
        console.log(
          `Task "${task.title}" (${task._id}) start_time: ${startTime.toISOString()}, end_time: ${endTime.toISOString()}`
        );

        // If already overdue, mark it immediately
        if (endTime < now) {
          console.log(
            `Task "${task.title}" (${task._id}) is already overdue! Marking immediately.`
          );
          markTaskAsOverdue(task);
          return;
        }

        // Calculate total task duration and 75% point
        const totalDuration = endTime.getTime() - startTime.getTime();
        const nearDueTime = new Date(
          startTime.getTime() + totalDuration * 0.75
        );

        // If current time is past 75% point but not overdue, send near due notification immediately
        if (
          now >= nearDueTime &&
          now < endTime &&
          !nearDueNotifiedTaskIds[task._id]
        ) {
          console.log(
            `Task "${task.title}" (${task._id}) is already past 75% point! Notifying immediately.`
          );
          notifyTaskNearDue(task);
        }
        // If 75% point is in the future, schedule notification
        else if (nearDueTime > now && !nearDueNotifiedTaskIds[task._id]) {
          const timeUntilNearDue = nearDueTime.getTime() - now.getTime();
          console.log(
            `Task "${task.title}" (${task._id}) will reach 75% in ${timeUntilNearDue}ms (${timeUntilNearDue / 1000 / 60} minutes)`
          );

          // Set timeout for 75% notification
          const nearDueTimeoutId = setTimeout(() => {
            console.log(
              `75% timeout triggered for task "${task.title}" (${task._id})`
            );
            notifyTaskNearDue(task);
          }, timeUntilNearDue);

          // Store the timeout reference
          timeoutRefs.current[`near_due_${task._id}`] = nearDueTimeoutId;
        }

        // Calculate milliseconds until deadline
        const timeUntilDeadline = endTime.getTime() - now.getTime();
        console.log(
          `Task "${task.title}" (${task._id}) will be overdue in ${timeUntilDeadline}ms (${timeUntilDeadline / 1000 / 60} minutes)`
        );

        // Set timeout to mark as overdue exactly when the deadline is reached
        const overdueTimeoutId = setTimeout(() => {
          console.log(
            `Overdue timeout triggered for task "${task.title}" (${task._id})`
          );
          markTaskAsOverdue(task);
        }, timeUntilDeadline);

        // Store the timeout reference
        timeoutRefs.current[`task_${task._id}`] = overdueTimeoutId;
      } else if (task.end_time) {
        const endTime = new Date(task.end_time);
        console.log(
          `Task "${task.title}" (${task._id}) has only end_time: ${endTime.toISOString()}`
        );

        // If already overdue, mark it immediately
        if (endTime < now) {
          console.log(
            `Task "${task.title}" (${task._id}) is already overdue! Marking immediately.`
          );
          markTaskAsOverdue(task);
          return;
        }

        // Calculate milliseconds until deadline
        const timeUntilDeadline = endTime.getTime() - now.getTime();
        console.log(
          `Task "${task.title}" (${task._id}) will be overdue in ${timeUntilDeadline}ms (${timeUntilDeadline / 1000 / 60} minutes)`
        );

        // Set timeout to mark as overdue exactly when the deadline is reached
        const timeoutId = setTimeout(() => {
          console.log(
            `Timeout triggered for task "${task.title}" (${task._id})`
          );
          markTaskAsOverdue(task);
        }, timeUntilDeadline);

        // Store the timeout reference
        timeoutRefs.current[`task_${task._id}`] = timeoutId;
      } else {
        console.log(
          `Task "${task.title}" (${task._id}) has no end_time, skipping`
        );
      }
    });

    // Schedule timeouts for task events
    console.log(`Total task events to check: ${taskEvents.length}`);
    taskEvents.forEach(event => {
      // Skip events that are already checked
      if (checkedEventIds[event._id]) {
        console.log(
          `Skipping event "${event.title}" (${event._id}): already checked`
        );
        return;
      }

      // Check if event has end time
      if (event.end_time) {
        const endTime = new Date(event.end_time);
        console.log(
          `Event "${event.title}" (${event._id}) end_time: ${endTime.toISOString()}`
        );

        // If already overdue, mark it immediately
        if (endTime < now) {
          console.log(
            `Event "${event.title}" (${event._id}) is already overdue! Marking immediately.`
          );
          markTaskEventAsOverdue(event);
          return;
        }

        // Calculate milliseconds until deadline
        const timeUntilDeadline = endTime.getTime() - now.getTime();
        console.log(
          `Event "${event.title}" (${event._id}) will be overdue in ${timeUntilDeadline}ms (${timeUntilDeadline / 1000 / 60} minutes)`
        );

        // Set timeout to mark as overdue exactly when the deadline is reached
        const timeoutId = setTimeout(() => {
          console.log(
            `Timeout triggered for event "${event.title}" (${event._id})`
          );
          markTaskEventAsOverdue(event);
        }, timeUntilDeadline);

        // Store the timeout reference
        timeoutRefs.current[`event_${event._id}`] = timeoutId;
      } else {
        console.log(
          `Event "${event.title}" (${event._id}) has no end_time, skipping`
        );
      }
    });
  };

  // Check for near due tasks (75% time elapsed) and send notifications
  const checkNearDueTasks = async () => {
    const now = new Date();
    console.log(`Manual check for near due tasks at ${now.toISOString()}`);

    // Check regular tasks
    for (const task of tasks) {
      // Skip tasks that are already completed, marked as overdue, or already notified
      if (
        task.status === 'completed' ||
        task.status === 'overdue' ||
        nearDueNotifiedTaskIds[task._id]
      ) {
        continue;
      }

      // Check if task is near due using our utility function
      if (
        task.start_time &&
        task.end_time &&
        isTaskNearDue(task.start_time, task.end_time, task.status)
      ) {
        console.log(
          `Manual check found near due task "${task.title}" (${task._id})`
        );
        await notifyTaskNearDue(task);
      }
    }
  };

  // Check for overdue tasks and send notifications (still keep this for backup)
  const checkOverdueTasks = async () => {
    const now = new Date();
    console.log(`Manual check for overdue tasks at ${now.toISOString()}`);

    // Check regular tasks
    for (const task of tasks) {
      // Skip tasks that are already completed or already marked as overdue
      if (task.status === 'completed' || task.status === 'overdue') {
        continue;
      }

      // Check if task has deadline and is overdue
      if (task.end_time && isTaskOverdue(task.end_time, task.status)) {
        console.log(
          `Manual check found overdue task "${task.title}" (${task._id})`
        );
        await markTaskAsOverdue(task);
      }
    }
  };

  // Check for overdue task events and send notifications (still keep this for backup)
  const checkOverdueTaskEvents = async () => {
    const now = new Date();
    console.log(`Manual check for overdue events at ${now.toISOString()}`);

    for (const event of taskEvents) {
      // Skip events that are already checked
      if (checkedEventIds[event._id]) {
        continue;
      }

      // Check if event has end time and is overdue
      if (event.end_time) {
        const endTime = new Date(event.end_time);

        if (endTime < now) {
          console.log(
            `Manual check found overdue event "${event.title}" (${event._id})`
          );
          await markTaskEventAsOverdue(event);
        }
      }
    }
  };

  // Combined check function for both tasks and events
  const checkAllOverdue = useCallback(async () => {
    console.log('Running complete overdue check for all tasks and events');
    await checkNearDueTasks(); // Check for near due tasks first
    await checkOverdueTasks();
    await checkOverdueTaskEvents();
  }, [tasks, taskEvents]);

  // Force check function that can be called manually
  const forceCheckOverdue = useCallback(async () => {
    console.log('Force checking all tasks and events for overdue status');

    // Clear all timeouts and reschedule
    Object.values(timeoutRefs.current).forEach(timeout =>
      clearTimeout(timeout)
    );
    timeoutRefs.current = {};

    // Run immediate check
    const now = new Date();
    console.log(`Force check at time: ${now.toISOString()}`);

    // Check all tasks regardless of previous checks
    console.log(`Force checking ${tasks.length} tasks for overdue status`);
    let overdueCount = 0;

    for (const task of tasks) {
      // Skip tasks that are already completed or already marked as overdue
      if (task.status === 'completed' || task.status === 'overdue') {
        console.log(
          `Skipping task "${task.title}" (${task._id}): status=${task.status}`
        );
        continue;
      }

      console.log(
        `Checking task "${task.title}" (${task._id}), status: ${task.status}, end_time: ${task.end_time}`
      );

      if (task.end_time) {
        const endTime = new Date(task.end_time);
        console.log(`  Task end time: ${endTime.toISOString()}`);
        console.log(`  Current time: ${now.toISOString()}`);
        console.log(`  Is end time before now? ${endTime < now}`);

        if (endTime < now) {
          overdueCount++;
          console.log(
            `Force check found overdue task "${task.title}" (${task._id})`
          );
          await markTaskAsOverdue(task);
        }
      }
    }

    console.log(`Found ${overdueCount} overdue tasks during force check`);

    // Reschedule timeouts
    scheduleTaskTimeouts();

    return overdueCount;
  }, [tasks, taskEvents]);

  // Schedule precise timeouts when tasks or events change
  useEffect(() => {
    console.log('Tasks or events changed, rescheduling timeouts');
    scheduleTaskTimeouts();

    // Also run the regular check for any tasks that might have been missed
    checkAllOverdue();

    // Still keep the interval as a fallback
    const intervalId = setInterval(() => {
      console.log('Running scheduled interval check');
      checkAllOverdue();
    }, 60000); // 60000ms = 1 minute

    return () => {
      // Clean up all timeouts when component unmounts or dependencies change
      clearInterval(intervalId);
      Object.values(timeoutRefs.current).forEach(timeout =>
        clearTimeout(timeout)
      );
      console.log('Cleaned up all timeouts and intervals');
    };
  }, [tasks, taskEvents]);

  return {
    checkOverdueTasks,
    checkOverdueTaskEvents,
    checkAllOverdue,
    forceCheckOverdue,
  };
};
