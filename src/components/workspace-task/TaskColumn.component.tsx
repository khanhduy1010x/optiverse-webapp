import React from 'react';
import { useTranslation } from 'react-i18next';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { TaskCard } from './index';

interface TaskColumnProps {
  columnId: string;
  columnTitle: string;
  columnColor: string;
  tasks: WorkspaceTask[];
  workspaceId: string;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  columnId,
  columnTitle,
  columnColor,
  tasks,
  workspaceId,
}) => {
  const { t } = useTranslation('workspace-task');
  return (
    <div className="workspace-task-column">
      {/* Column Header */}
      <div className={`workspace-task-column-header ${columnId}`}>
        <div className="workspace-task-column-header-content">
          <h3>{columnTitle}</h3>
          <span className="workspace-task-column-badge">{tasks.length}</span>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="workspace-task-column-body">
        {tasks.length === 0 ? (
          <div className="workspace-task-empty-state">
            <p>📭 {t('Workspace Task Empty')}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task._id} task={task} workspaceId={workspaceId} columnId={columnId} />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
