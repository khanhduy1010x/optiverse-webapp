import React from 'react';
import { useTaskEventList } from '../../hooks/task-events/useTaskEventList.hook';
import { useAutoRefresh } from '../../hooks/task-events/useAutoRefresh.hook';
import { LoadingState } from '../../components/task-event/LoadingState.component';
import { ErrorState } from '../../components/task-event/ErrorState.component';
import { CalendarContainer } from '../../components/task-event/CalendarContainer.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const TaskEvent: React.FC = () => {
  const { t } = useAppTranslate('task');

  // Custom hook to fetch task events (now uses userId internally)
  const { 
    taskEvents, 
    loading, 
    error, 
    refreshTaskEvents, 
    addEvent, 
    removeEvent, 
    updateEvent 
  } = useTaskEventList();

  // Custom hook for auto-refresh functionality
  const { triggerRefresh } = useAutoRefresh(refreshTaskEvents, {
    interval: 30000,
    enabled: false // Disable auto refresh
  });

  // Handle reload - refresh task events
  const handleReload = () => {
    try {
      refreshTaskEvents();
    } catch (error) {
      console.error('Error reloading data:', error);
    }
  };

  // Show loading state while fetching events
  if (loading) {
    return <LoadingState message={t('loading_events')} />;
  }

  // Show error state if there was an error fetching events
  if (error) {
    return <ErrorState message={error} onRetry={handleReload} />;
  }

  return (
    <CalendarContainer
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

export default TaskEvent;