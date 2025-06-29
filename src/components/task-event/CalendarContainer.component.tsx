import React from 'react';
import { Calendar } from './Calendar.component';
import { RefreshButton } from './RefreshButton.component';
import { TaskEvent } from '../../types/task-events/task-events.types';

interface CalendarContainerProps {
  taskId: string;
  taskEvents: TaskEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (event: TaskEvent) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (eventId: string, updatedEvent: TaskEvent) => void;
  refreshTaskEvents: () => void;
  onRefresh: () => void;
}

export const CalendarContainer: React.FC<CalendarContainerProps> = ({
  taskId,
  taskEvents,
  loading,
  error,
  addEvent,
  removeEvent,
  updateEvent,
  refreshTaskEvents,
  onRefresh
}) => {
  return (
    <div className="h-[calc(100vh-64px)] relative">
      <Calendar
        taskId={taskId}
        taskEvents={taskEvents}
        loading={loading}
        error={error}
        addEvent={addEvent}
        removeEvent={removeEvent}
        updateEvent={updateEvent}
        refreshTaskEvents={refreshTaskEvents}
      />
      <div className="absolute bottom-4 right-4 z-10">
        <RefreshButton onClick={onRefresh} />
      </div>
    </div>
  );
}; 