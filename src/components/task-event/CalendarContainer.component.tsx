import React from 'react';
import { Calendar } from './Calendar.component';
import { RefreshButton } from './RefreshButton.component';
import { TaskEvent } from '../../types/task-events/task-events.types';

interface CalendarContainerProps {
  taskEvents: TaskEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (event: TaskEvent) => void;
  removeEvent: (eventId: string, deleteOption?: 'all' | 'this') => void;
  updateEvent: (eventId: string, updatedEvent: TaskEvent, updateOption?: 'all' | 'this') => void;
  refreshTaskEvents: () => void;
  onRefresh: () => void;
}

export const CalendarContainer: React.FC<CalendarContainerProps> = ({
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
    <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50 overflow-auto">
      {/* Sidebar sẽ được render ở ngoài CalendarContainer nếu có */}
      <div className="flex-1 h-full bg-white flex flex-col relative transition-all duration-300 overflow-auto">
        <div className="flex-1 flex flex-col">
          <Calendar
            taskEvents={taskEvents}
            loading={loading}
            error={error}
            addEvent={addEvent}
            removeEvent={removeEvent}
            updateEvent={updateEvent}
            refreshTaskEvents={refreshTaskEvents}
          />
        </div>
      </div>
    </div>
  );
};