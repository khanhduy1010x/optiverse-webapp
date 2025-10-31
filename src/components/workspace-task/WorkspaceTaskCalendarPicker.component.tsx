import React, { useState } from 'react';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import WorkspaceTaskWeekView from './WorkspaceTaskWeekView.component';
import WorkspaceTaskCalendarView from './WorkspaceTaskCalendarView.component';

interface WorkspaceTaskCalendarPickerProps {
  workspaceId: string;
  tasks: WorkspaceTask[];
  onTaskClick?: (task: WorkspaceTask) => void;
}

const WorkspaceTaskCalendarPicker: React.FC<WorkspaceTaskCalendarPickerProps> = ({
  workspaceId,
  tasks,
  onTaskClick,
}) => {
  const [calendarMode, setCalendarMode] = useState<'week' | 'month'>('week');

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Mode Selector */}
      <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setCalendarMode('week')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            calendarMode === 'week'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          }`}
        >
          📅 Week View
        </button>
        <button
          onClick={() => setCalendarMode('month')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            calendarMode === 'month'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          }`}
        >
          🗓️ Month View
        </button>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto">
        {calendarMode === 'week' && (
          <WorkspaceTaskWeekView
            workspaceId={workspaceId}
            tasks={tasks}
            onTaskClick={onTaskClick}
          />
        )}
        {calendarMode === 'month' && (
          <WorkspaceTaskCalendarView
            workspaceId={workspaceId}
            tasks={tasks}
            onTaskClick={onTaskClick}
          />
        )}
      </div>
    </div>
  );
};

export default WorkspaceTaskCalendarPicker;
