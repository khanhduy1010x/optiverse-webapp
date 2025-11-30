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
import WorkspaceTaskBoard from '../../components/workspace-task/WorkspaceTaskBoard.component';
import WorkspaceHeader from '../../components/workspace-task/WorkspaceHeader.component';
import WorkspaceCreateTaskModal from '../../components/workspace-task/WorkspaceCreateTaskModal.component';
import WorkspaceEditTaskModal from '../../components/workspace-task/WorkspaceEditTaskModal.component';
import WorkspaceTaskDetailModal from '../../components/workspace-task/WorkspaceTaskDetailModal.component';
import FloatingAddTaskButton from '../../components/task/FloatingAddTaskButton.component';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import workspaceService from '../../services/workspace.service';

const WorkspaceDetail: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Get current user from auth store
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?._id;
  
  const tasks = useSelector(selectAllTasks);
  const tasksByStatus = useSelector(selectTasksByStatus);
  const loading = useSelector(selectWorkspaceTaskLoading);

  const [activeTab, setActiveTab] = useState<'to-do' | 'in-progress' | 'done' | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WorkspaceTask | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<Array<{ _id: string; full_name: string; email: string; avatar_url?: string; role?: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Compute current user role
  const currentUserRole = workspaceMembers.length > 0 
    ? (workspaceMembers.find(m => m._id === currentUserId)?.role as 'admin' | 'user') || 'user'
    : 'user';

  useEffect(() => {
    if (workspaceId) {
      console.log('[Page] Fetching tasks for workspaceId:', workspaceId);
      dispatch(getTasksByWorkspace(workspaceId));
      
      // Fetch workspace members
      fetchWorkspaceMembers(workspaceId);
    }
  }, [workspaceId, dispatch]);

  const fetchWorkspaceMembers = async (id: string) => {
    try {
      const workspaceDetail = await workspaceService.getWorkspaceById(id);
      const activeMembersArray = workspaceDetail?.members?.active || [];
      // Map UserDetailDto to the format expected by assign modal
      const mappedMembers = activeMembersArray.map((user: any) => ({
        _id: user.user_id,
        full_name: user.full_name || 'Unknown',
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role || 'user', // Include role field
      }));
      console.log('[Page] Workspace members:', mappedMembers);
      setWorkspaceMembers(mappedMembers);
    } catch (err) {
      console.error('[Page] Failed to fetch workspace members:', err);
      setWorkspaceMembers([]);
    }
  };

  useEffect(() => {
    console.log('[Page] Tasks updated:', tasks);
    console.log('[Page] TasksByStatus updated:', tasksByStatus);
  }, [tasks, tasksByStatus]);

  // Handle task edit
  const handleTaskEdit = (task: WorkspaceTask) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  // Handle task detail view
  const handleTaskDetail = (task: WorkspaceTask) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  // Close modals
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  // Calculate task counts
  const taskCounts = {
    all: tasks.length,
    'to-do': tasks.filter(t => t.status === 'to-do').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    'done': tasks.filter(t => t.status === 'done').length,
  };

  // Filter tasks by search query
  const filteredTasks = searchQuery.trim() 
    ? tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tasks;

  // Filter tasks by status for board view
  const filteredTasksByStatus = {
    'to-do': filteredTasks.filter(t => t.status === 'to-do'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    'done': filteredTasks.filter(t => t.status === 'done'),
  };

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-500">{t('workspace_not_found')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header - Apple Style */}
      <div className="px-8 py-6 border-b border-gray-100">
        <WorkspaceHeader 
          workspace={{
            _id: workspaceId,
            name: 'Workspace Tasks',
          } as any}
          onAddTask={() => setShowCreateModal(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-3 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
              <p className="text-gray-500 text-sm font-medium">Loading tasks...</p>
            </div>
          </div>
        ) : (
          <WorkspaceTaskBoard
            workspaceId={workspaceId!}
            tasks={filteredTasks}
            tasksByStatus={filteredTasksByStatus}
            filterStatus={activeTab}
            workspaceMembers={workspaceMembers}
            currentUserId={currentUserId}
            currentUserRole={(() => {
              // Find current user's role in workspace
              const member = workspaceMembers.find(m => m._id === currentUserId);
              return (member?.role as 'admin' | 'user') || 'user';
            })()}
            workspaceOwnerId={workspaceMembers.find(m => m.role === 'admin')?._id}
            onTaskEdit={handleTaskEdit}
            onTaskClick={handleTaskDetail}
            onRefreshMembers={() => fetchWorkspaceMembers(workspaceId!)}
          />
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <WorkspaceCreateTaskModal
          workspaceId={workspaceId!}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && (
        <WorkspaceEditTaskModal
          task={selectedTask}
          workspaceId={workspaceId!}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Task Detail Modal */}
      {showDetailModal && selectedTask && (
        <WorkspaceTaskDetailModal
          task={selectedTask}
          workspaceId={workspaceId!}
          workspaceMembers={workspaceMembers}
          currentUserId={currentUserId}
          currentUserRole={(() => {
            // Find current user's role in workspace
            const member = workspaceMembers.find(m => m._id === currentUserId);
            return (member?.role as 'admin' | 'user') || 'user';
          })()}
          onClose={handleCloseDetailModal}
        />
      )}

      {/* Floating Add Task Button - Apple Style */}
      {currentUserRole === 'admin' && (
        <FloatingAddTaskButton
          onClick={() => setShowCreateModal(true)}
          title="Add Task"
        />
      )}
    </div>
  );
};

export default WorkspaceDetail;
