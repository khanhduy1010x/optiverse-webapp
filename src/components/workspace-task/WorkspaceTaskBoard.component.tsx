import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, ChevronDown, Lock } from 'lucide-react';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import WorkspaceTaskListView from './WorkspaceTaskListView.component';
import WorkspaceTaskBoardView from './WorkspaceTaskBoardView.component';
import WorkspaceTaskCalendarPicker from './WorkspaceTaskCalendarPicker.component';
import WorkspaceMemberPermissionModal from './WorkspaceMemberPermissionModal.component';

interface WorkspaceTaskBoardProps {
  workspaceId: string;
  tasks: WorkspaceTask[];
  tasksByStatus: {
    'to-do': WorkspaceTask[];
    'in-progress': WorkspaceTask[];
    done: WorkspaceTask[];
  };
  filterStatus?: 'to-do' | 'in-progress' | 'done' | 'all';
  workspaceMembers?: Array<{ _id: string; full_name: string; email: string; avatar_url?: string; role?: string }>;
  onTaskEdit?: (task: WorkspaceTask) => void;
  onTaskClick?: (task: WorkspaceTask) => void;
  workspaceOwnerId?: string;
  currentUserId?: string;
  currentUserRole?: 'admin' | 'user';
  onRefreshMembers?: () => void;
}

const WorkspaceTaskBoard: React.FC<WorkspaceTaskBoardProps> = ({
  workspaceId,
  tasks,
  tasksByStatus,
  filterStatus = 'all',
  workspaceMembers = [],
  onTaskEdit,
  onTaskClick,
  workspaceOwnerId,
  currentUserId,
  currentUserRole = 'user',
  onRefreshMembers,
}) => {
  const { t } = useTranslation('workspace-task');
  const [viewType, setViewType] = useState<'list' | 'board' | 'calendar'>('list');
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const [showMemberPermissionModal, setShowMemberPermissionModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Check if current user is owner - using both ID comparison and role
  const isOwner = currentUserId === workspaceOwnerId || currentUserRole === 'admin';

  React.useEffect(() => {
    console.log('[WorkspaceTaskBoard] currentUserId:', currentUserId);
    console.log('[WorkspaceTaskBoard] workspaceOwnerId:', workspaceOwnerId);
    console.log('[WorkspaceTaskBoard] isOwner:', isOwner);
    console.log('[WorkspaceTaskBoard] currentUserRole:', currentUserRole);
  }, [currentUserId, workspaceOwnerId, isOwner, currentUserRole]);

  const handleMemberClick = (member: any) => {
    console.log('[WorkspaceTaskBoard] Member clicked:', member);
    console.log('[WorkspaceTaskBoard] isOwner at click:', isOwner);
    setSelectedMember(member);
    setShowMemberPermissionModal(true);
    setShowMembersDropdown(false);
  };

  const handleMemberPermissionUpdated = () => {
    setShowMemberPermissionModal(false);
    setSelectedMember(null);
    // Refresh members list to get updated roles
    if (onRefreshMembers) {
      onRefreshMembers();
    }
  };

  React.useEffect(() => {
    console.log('[TaskBoard] Rendered with tasks:', tasks);
    console.log('[TaskBoard] tasksByStatus:', tasksByStatus);
    console.log('[TaskBoard] viewType:', viewType);
  }, [tasks, tasksByStatus, viewType]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Bar - View Selector and Member Management */}
      <div className="flex items-center justify-between mb-6 gap-4">
        {/* Left: View Selector - Apple Style */}
        <div className="flex gap-1">
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
              {view === 'list' ? `📋 ${t('workspace_task.list')}` : view === 'board' ? `📊 ${t('workspace_task.board')}` : `📅 ${t('workspace_task.calendar')}`}
            </button>
          ))}
        </div>

        {/* Right: Member Management - Apple Style */}
        <div className="relative">
          <button
            onClick={() => setShowMembersDropdown(!showMembersDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 text-sm font-medium"
          >
            <Users className="w-4 h-4" />
            <span>{workspaceMembers.length}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMembersDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Members Dropdown */}
          {showMembersDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900">{t('workspace_task.team_members')} ({workspaceMembers.length})</p>
              </div>

              {/* Members List */}
              <div className="max-h-96 overflow-y-auto">
                {workspaceMembers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    {t('workspace_task.no_members_yet')}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {workspaceMembers.map((member) => (
                      <div
                        key={member._id}
                        onClick={() => member._id !== currentUserId && handleMemberClick(member)}
                        className={`px-4 py-3 flex items-center gap-3 ${
                          member._id !== currentUserId
                            ? 'hover:bg-blue-50 cursor-pointer transition-colors duration-200'
                            : 'hover:bg-gray-50 transition-colors duration-200'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span>{member.full_name?.[0]?.toUpperCase() || '?'}</span>
                          )}
                        </div>

                        {/* Member Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{member.full_name}</p>
                            {member._id === workspaceOwnerId ? (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                Owner
                              </span>
                            ) : member.role === 'admin' ? (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                                Admin
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                {t('workspace_task.member')}
                              </span>
                            )}
                            {member._id === currentUserId && (
                              <span className="text-xs text-gray-500">({t('workspace_task.you')})</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
                  {t('workspace_task.manage_members')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-auto">
        {viewType === 'list' && (
          <WorkspaceTaskListView
            workspaceId={workspaceId}
            tasks={tasks}
            workspaceMembers={workspaceMembers}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
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
            onTaskClick={onTaskClick}
          />
        )}
        {viewType === 'calendar' && (
          <WorkspaceTaskCalendarPicker
            workspaceId={workspaceId}
            tasks={tasks}
            onTaskClick={onTaskClick}
          />
        )}
      </div>

      {/* Workspace Member Permission Modal */}
      {showMemberPermissionModal && selectedMember && (
        <WorkspaceMemberPermissionModal
          isOpen={showMemberPermissionModal}
          onClose={() => setShowMemberPermissionModal(false)}
          member={selectedMember}
          workspaceId={workspaceId}
          isOwner={isOwner}
          onPermissionUpdated={handleMemberPermissionUpdated}
        />
      )}
    </div>
  );
};

export default WorkspaceTaskBoard;
