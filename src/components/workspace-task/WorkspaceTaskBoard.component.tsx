import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { TaskColumn, CreateTaskModal } from './index';
import '../../styles/workspace-task.style.css';

interface WorkspaceTaskBoardProps {
  workspaceId: string;
  tasks: WorkspaceTask[];
  tasksByStatus: {
    'to-do': WorkspaceTask[];
    'in-progress': WorkspaceTask[];
    done: WorkspaceTask[];
  };
}

const WorkspaceTaskBoard: React.FC<WorkspaceTaskBoardProps> = ({
  workspaceId,
  tasks,
  tasksByStatus,
}) => {
  const { t } = useTranslation('workspace-task');
  const dispatch = useDispatch<AppDispatch>();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns = [
    { id: 'to-do', title: t('workspace_task.columns.to_do'), color: 'from-red-500 to-orange-500' },
    {
      id: 'in-progress',
      title: t('workspace_task.columns.in_progress'),
      color: 'from-yellow-500 to-amber-500',
    },
    { id: 'done', title: t('workspace_task.columns.done'), color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <>
      {/* Header with Add Button */}
      <div className="workspace-task-board-header">
        <button
          onClick={() => setShowCreateModal(true)}
          className="workspace-task-btn-primary"
        >
          + {t('workspace_task.add_task')}
        </button>
      </div>

      {/* Kanban Board */}
      <div className="workspace-task-board">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            columnId={column.id}
            columnTitle={column.title}
            columnColor={column.color}
            tasks={tasksByStatus[column.id as keyof typeof tasksByStatus]}
            workspaceId={workspaceId}
          />
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          workspaceId={workspaceId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
};

export default WorkspaceTaskBoard;
