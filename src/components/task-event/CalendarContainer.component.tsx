import React from 'react';
import { Calendar } from './Calendar.component';
import { TaskEvent } from '../../types/task-events/task-events.types';

interface CalendarContainerProps {
  taskEvents: TaskEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (event: TaskEvent) => void;
  removeEvent: (eventId: string, deleteOption?: 'all' | 'this') => void;
  updateEvent: (eventId: string, updatedEvent: TaskEvent, updateOption?: 'all' | 'this') => void;
  refreshImportedEvents: () => void;
}

export const CalendarContainer: React.FC<CalendarContainerProps> = ({
  taskEvents,
  loading,
  error,
  addEvent,
  removeEvent,
  updateEvent,
  refreshImportedEvents
}) => {
  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="flex-1 flex flex-col w-full h-full overflow-auto">
        <Calendar
          taskEvents={taskEvents}
          loading={loading}
          error={error}
          addEvent={addEvent}
          removeEvent={removeEvent}
          updateEvent={updateEvent}
          refreshImportedEvents={refreshImportedEvents}
        />
      </div>
    </div>
  );
};