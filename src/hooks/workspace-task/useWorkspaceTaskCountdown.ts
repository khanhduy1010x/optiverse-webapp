import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { updateTaskStatus } from '../../store/slices/workspace_task.slice';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { formatDistanceToNow, isPast, parse, isToday, isTomorrow, format } from 'date-fns';

interface UseWorkspaceTaskCountdownReturn {
  countdownText: string;
  isOverdue: boolean;
  formattedDeadline: string;
}

/**
 * Hook to manage workspace task deadline countdown
 * - Displays formatted time remaining until deadline
 * - Automatically marks task as done when deadline passes
 * - Provides overdue status for styling
 */
export const useWorkspaceTaskCountdown = (
  task: WorkspaceTask,
  workspaceId: string,
): UseWorkspaceTaskCountdownReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const [countdownText, setCountdownText] = useState<string>('');
  const [isOverdue, setIsOverdue] = useState<boolean>(false);
  const [formattedDeadline, setFormattedDeadline] = useState<string>('');

  useEffect(() => {
    if (!task.end_time) {
      return;
    }

    const updateCountdown = () => {
      const deadlineDate = new Date(task.end_time as string | Date);
      const now = new Date();

      // Check if deadline has passed
      const hasExpired = isPast(deadlineDate) && now > deadlineDate;

      // Only auto-change status if task is not already done and deadline has passed
      if (hasExpired && task.status !== 'done') {
        dispatch(updateTaskStatus({
          workspaceId,
          taskId: task._id,
          status: 'done',
        }));
      }

      setIsOverdue(hasExpired);

      // Format countdown text
      if (hasExpired) {
        setCountdownText(`Overdue by ${formatDistanceToNow(deadlineDate)}`);
      } else {
        setCountdownText(`Due in ${formatDistanceToNow(deadlineDate)}`);
      }

      // Format deadline display
      let formattedDate = '';
      if (isToday(deadlineDate)) {
        formattedDate = `Today at ${format(deadlineDate, 'HH:mm')}`;
      } else if (isTomorrow(deadlineDate)) {
        formattedDate = `Tomorrow at ${format(deadlineDate, 'HH:mm')}`;
      } else {
        formattedDate = format(deadlineDate, 'MMM dd, yyyy');
      }
      setFormattedDeadline(formattedDate);
    };

    // Initial update
    updateCountdown();

    // Update every minute (60000ms)
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [task.end_time, task.status, task._id, workspaceId, dispatch]);

  return {
    countdownText,
    isOverdue,
    formattedDeadline,
  };
};
