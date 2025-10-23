import React from 'react';
import { useTranslation } from 'react-i18next';
import { Workspace } from '../../types/workspace/response/workspace.response';

interface WorkspaceHeaderProps {
  workspace: Workspace;
  activeTab: 'board' | 'list';
  setActiveTab: (tab: 'board' | 'list') => void;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  workspace,
  activeTab,
  setActiveTab,
}) => {
  const { t } = useTranslation('workspace-task');

  return (
    <div className="workspace-task-header">
      <div className="workspace-task-header-container">
        {/* Workspace Info */}
        <div className="workspace-task-header-info">
          <h1 className="workspace-task-header-title">{workspace.name}</h1>
          {workspace.description && (
            <p className="workspace-task-header-description">{workspace.description}</p>
          )}
          <p className="workspace-task-header-id">ID: {workspace._id}</p>
        </div>

        {/* Tabs */}
        <div className="workspace-task-header-tabs">
          <button
            onClick={() => setActiveTab('board')}
            className={`workspace-task-header-tab ${
              activeTab === 'board' ? 'active' : ''
            }`}
          >
            📋 {t('workspace_task.kanban_board')}
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`workspace-task-header-tab ${
              activeTab === 'list' ? 'active' : ''
            }`}
          >
            📝 {t('workspace_task.list_view')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHeader;
