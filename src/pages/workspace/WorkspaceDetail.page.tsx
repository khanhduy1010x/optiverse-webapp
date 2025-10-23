import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store';
import { getTasksByWorkspace } from '../../store/slices/workspace_task.slice';
import {
  selectAllTasks,
  selectTasksByStatus,
  selectWorkspaceTaskLoading,
} from '../../store/selector/workspace-task.selector';

// Import components with barrel exports
import { WorkspaceTaskBoard, WorkspaceHeader } from '../../components/workspace-task/index';

const WorkspaceDetail: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const tasks = useSelector(selectAllTasks);
  const tasksByStatus = useSelector(selectTasksByStatus);
  const loading = useSelector(selectWorkspaceTaskLoading);

  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');

  useEffect(() => {
    if (workspaceId) {
      dispatch(getTasksByWorkspace(workspaceId));
    }
  }, [workspaceId, dispatch]);

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-500">{t('workspace_not_found')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <WorkspaceHeader 
        workspace={{
          _id: workspaceId,
          name: 'Workspace Tasks',
        } as any}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'board' && (
              <WorkspaceTaskBoard
                workspaceId={workspaceId!}
                tasks={tasks}
                tasksByStatus={tasksByStatus}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkspaceDetail;
