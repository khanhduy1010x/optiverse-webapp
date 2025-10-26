import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import WorkspaceTaskListView from './WorkspaceTaskListView.component';
import WorkspaceTaskBoardView from './WorkspaceTaskBoardView.component';
import WorkspaceTaskCalendarPicker from './WorkspaceTaskCalendarPicker.component';

interface WorkspaceTaskBoardProps {
  workspaceId: string;
  tasks: WorkspaceTask[];
  tasksByStatus: {
    'to-do': WorkspaceTask[];
    'in-progress': WorkspaceTask[];
    done: WorkspaceTask[];
  };
  filterStatus?: 'to-do' | 'in-progress' | 'done' | 'all';
  workspaceMembers?: Array<{ _id: string; full_name: string; email: string; avatar_url?: string }>;
  onTaskEdit?: (task: WorkspaceTask) => void;
  onTaskClick?: (task: WorkspaceTask) => void;
}

const WorkspaceTaskBoard: React.FC<WorkspaceTaskBoardProps> = ({
  workspaceId,
  tasks,
  tasksByStatus,
  filterStatus = 'all',
  workspaceMembers = [],
  onTaskEdit,
  onTaskClick,
}) => {
  const { t } = useTranslation('workspace-task');
  const [viewType, setViewType] = useState<'list' | 'board' | 'calendar'>('list');

  React.useEffect(() => {
    console.log('[TaskBoard] Rendered with tasks:', tasks);
    console.log('[TaskBoard] tasksByStatus:', tasksByStatus);
    console.log('[TaskBoard] viewType:', viewType);
  }, [tasks, tasksByStatus, viewType]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* View Selector - Apple Style */}
      <div className="flex gap-1 mb-6">
        {['list', 'board', 'calendar'].map((view) => (
          <button
            key={view}
            onClick={() => setViewType(view as any)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              viewType === view
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {view === 'list' ? '📋 List' : view === 'board' ? '📊 Board' : '📅 Calendar'}
          </button>
        ))}
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-auto">
        {viewType === 'list' && (
          <WorkspaceTaskListView
            workspaceId={workspaceId}
            tasks={tasks}
            workspaceMembers={workspaceMembers}
            onTaskEdit={onTaskEdit}
            onTaskClick={onTaskClick}
          />
        )}
        {viewType === 'board' && (
          <WorkspaceTaskBoardView
            workspaceId={workspaceId}
            tasks={tasks}
            tasksByStatus={tasksByStatus}
            workspaceMembers={workspaceMembers}
          />
        )}
        {viewType === 'calendar' && (
          <WorkspaceTaskCalendarPicker
            workspaceId={workspaceId}
            tasks={tasks}
          />
        )}
      </div>
    </div>
  );
};

export default WorkspaceTaskBoard;
