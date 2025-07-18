import React from 'react';
import { useTaskEventList } from '../../hooks/task-events/useTaskEventList.hook';
import { useFirstTask } from '../../hooks/task-events/useFirstTask.hook';
import { useAutoRefresh } from '../../hooks/task-events/useAutoRefresh.hook';
import { LoadingState } from '../../components/task-event/LoadingState.component';
import { ErrorState } from '../../components/task-event/ErrorState.component';
import { EmptyState } from '../../components/task-event/EmptyState.component';
import { CalendarContainer } from '../../components/task-event/CalendarContainer.component';

const Schedule: React.FC = () => {
  // Custom hook to fetch the first task
  const { taskId, loading: loadingTask, error: taskError, refreshTask } = useFirstTask();

  // Custom hook to fetch task events
  const { 
    taskEvents, 
    loading, 
    error, 
    refreshTaskEvents, 
    addEvent, 
    removeEvent, 
    updateEvent 
  } = useTaskEventList(taskId || '');

  // Custom hook for auto-refresh functionality
  const { triggerRefresh } = useAutoRefresh(refreshTaskEvents, {
    interval: 30000,
    enabled: false // Disable auto refresh
  });

  // Handle reload - refresh cả task và task events
  const handleReload = () => {
    try {
      // Làm mới dữ liệu task
      refreshTask();
      
      // Làm mới dữ liệu task events nếu có taskId
      if (taskId) {
        refreshTaskEvents();
      }
    } catch (error) {
      console.error('Error reloading data:', error);
    }
  };

  // Show loading state while fetching tasks
  if (loadingTask) {
    return <LoadingState message="Loading tasks..." />;
  }

  // Show error state if there was an error fetching tasks
  if (taskError) {
    return <ErrorState message={taskError} onRetry={handleReload} />;
  }

  // Show empty state if no tasks were found
  if (!taskId) {
    return <EmptyState />;
  }

  return (
    <CalendarContainer
      taskId={taskId}
      taskEvents={taskEvents}
      loading={loading}
      error={error}
      addEvent={addEvent}
      removeEvent={removeEvent}
      updateEvent={updateEvent}
      refreshTaskEvents={refreshTaskEvents}
      onRefresh={triggerRefresh}
    />
  );
};

export default Schedule; 