import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import WorkspaceService from '../../services/workspace.service';
import groupService from '../../services/group.service';
import {
  WorkspaceDetailDto,
  UserDetailDto,
} from '../../types/workspace/response/workspace.response';
import { useToast } from '../useToast';
import { useAppTranslate } from '../useAppTranslate';

const useWorkspaceManagement = () => {
  const { workspaceId } = useParams();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { t } = useAppTranslate('workspace');

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [activeTab, setActiveTab] = useState('members');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isInviteMembersModalOpen, setIsInviteMembersModalOpen] =
    useState(false);
  const [isTransferOwnerModalOpen, setIsTransferOwnerModalOpen] =
    useState(false);
  const [transferSelectedUserId, setTransferSelectedUserId] =
    useState<string>('');

  const [memberRoleFilter, setMemberRoleFilter] = useState<
    'All' | 'Admin' | 'Member'
  >('All');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [requestSearchTerm, setRequestSearchTerm] = useState('');
  const [inviteSearchTerm, setInviteSearchTerm] = useState('');
  const [bannedSearchTerm, setBannedSearchTerm] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const [workspaceDetail, setWorkspaceDetail] =
    useState<WorkspaceDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspaceData = async () => {
    if (!workspaceId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await WorkspaceService.getWorkspaceById(workspaceId);
      setWorkspaceDetail(data);
      setHasPassword(data.hasPassword || false);

      // Auto-create workspace chat if not exists
      await ensureWorkspaceChat(data);
    } catch (err) {
      console.error('Failed to load workspace:', err);
      showError(t('dashboardWorkspace.toasts.workspaceLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Ensure workspace chat exists and sync members
  const ensureWorkspaceChat = async (workspace: WorkspaceDetailDto) => {
    if (!workspaceId) return;

    try {
      console.log('🔍 Checking workspace chat...');

      // Check if workspace chat exists
      const existingChat = await groupService.getWorkspaceChat(workspaceId);

      if (!existingChat) {
        console.log('🆕 Creating workspace chat...');

        // Get all active member IDs
        const activeMemberIds =
          workspace.members?.active?.map(m => m.user_id) || [];

        // Create workspace chat
        const chatId = await groupService.createWorkspaceChat(
          workspaceId,
          workspace.name,
          activeMemberIds
        );

        if (chatId) {
          console.log('✅ Workspace chat created:', chatId);
        } else {
          console.warn('⚠️ Failed to create workspace chat');
        }
      } else {
        console.log('✅ Workspace chat already exists:', existingChat.id);

        // Sync members to make sure they're up to date
        const activeMemberIds =
          workspace.members?.active?.map(m => m.user_id) || [];
        await groupService.syncWorkspaceMembers(workspaceId, activeMemberIds);
      }
    } catch (error) {
      console.error('❌ Error ensuring workspace chat:', error);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [workspaceId]);

  const navigate = useNavigate();

  const members = workspaceDetail?.members.active || [];
  const requests = workspaceDetail?.members.request || [];
  const invites = workspaceDetail?.members.invite || [];
  const banned = workspaceDetail?.members.banned || [];

  const currentUserRole = workspaceDetail?.role || null;
  const ownerId = workspaceDetail?.owner_id || null;

  const workspace = workspaceDetail
    ? {
        name: workspaceDetail.name,
        description: workspaceDetail.description || '',
        code: workspaceDetail.invite_code,
        permissions: workspaceDetail.permissions || [],
        createdAt: new Date().toISOString(),
      }
    : null;

  const reloadWorkspaceData = loadWorkspaceData;

  // Sync workspace chat members
  const syncWorkspaceChat = async () => {
    if (!workspaceId || !workspaceDetail) return;

    try {
      console.log('🔄 Syncing workspace chat members...');

      // Get all active member IDs
      const activeMemberIds = members.map(m => m.user_id);

      console.log('Active members to sync:', activeMemberIds);

      // Sync members to workspace chat
      const synced = await groupService.syncWorkspaceMembers(
        workspaceId,
        activeMemberIds
      );

      if (synced) {
        console.log('✅ Workspace chat members synced successfully');
      } else {
        console.warn('⚠️ Failed to sync workspace chat members');
      }
    } catch (error) {
      console.error('❌ Error syncing workspace chat:', error);
    }
  };

  const handleUpRole = async (userId: string) => {
    if (!workspaceId) return;
    try {
      const currentUser = members.find(m => m.user_id === userId);
      if (!currentUser) {
        showError(t('dashboardWorkspace.toasts.memberNotFound'));
        return;
      }

      const newRole = currentUser.role === 'admin' ? 'user' : 'admin';

      await WorkspaceService.updateMemberRole(
        workspaceId,
        userId.toString(),
        newRole
      );

      // Update local state instead of reloading
      setWorkspaceDetail(prevDetail => {
        if (!prevDetail) return prevDetail;

        const updatedMembers = prevDetail.members.active.map(member =>
          member.user_id === userId ? { ...member, role: newRole } : member
        );

        return {
          ...prevDetail,
          members: {
            ...prevDetail.members,
            active: updatedMembers,
          },
        };
      });

      // Update selectedMember if it's the same user
      if (selectedMember && selectedMember.user_id === userId) {
        setSelectedMember((prevSelected: any) => ({
          ...prevSelected,
          role: newRole === 'admin' ? 'Admin' : 'Member',
          rawRole: newRole,
        }));
      }

      const actionText =
        newRole === 'admin'
          ? t('dashboardWorkspace.toasts.promotedToAdmin')
          : t('dashboardWorkspace.toasts.demotedToMember');
      showSuccess(actionText);
    } catch (err) {
      console.error('Failed to update member role:', err);
      showError(t('dashboardWorkspace.toasts.memberRoleUpdateFailed'));
    }
    setOpenMenuId(null);
  };

  const handleKick = async (userId: string) => {
    if (!workspaceId) return;
    try {
      await WorkspaceService.removeMemberFromWorkspace(
        workspaceId,
        userId.toString()
      );
      await reloadWorkspaceData();

      // Sync workspace chat after removing member
      await syncWorkspaceChat();
    } catch (err) {
      console.error('Failed to remove member:', err);
      showError(t('dashboardWorkspace.toasts.memberRemoveFailed'));
    }
    setOpenMenuId(null);
  };

  const handleToBlacklist = async (userId: string) => {
    if (!workspaceId) return;
    try {
      await WorkspaceService.banUser(workspaceId, undefined, userId);
      await reloadWorkspaceData();
      showSuccess(t('dashboardWorkspace.toasts.memberBanned'));
    } catch (err) {
      console.error('Failed to ban member:', err);
      showError(t('dashboardWorkspace.toasts.memberBanFailed'));
    }
    setOpenMenuId(null);
  };

  const handleAccept = async (userId: string) => {
    if (!workspaceId) return;
    try {
      console.log('Accepting request for userId:', userId);
      await WorkspaceService.approveJoinRequest(workspaceId, userId.toString());
      await reloadWorkspaceData();

      // Sync workspace chat members after accepting
      await syncWorkspaceChat();

      showSuccess(t('dashboardWorkspace.toasts.requestAccepted'));
    } catch (err) {
      console.error('Failed to accept request:', err);
      showError(t('dashboardWorkspace.toasts.requestAcceptFailed'));
    }
  };

  const handleReject = async (userId: string) => {
    if (!workspaceId) return;
    try {
      console.log('Rejecting request for userId:', userId);
      await WorkspaceService.rejectJoinRequest(workspaceId, userId.toString());
      await reloadWorkspaceData();
      showSuccess(t('dashboardWorkspace.toasts.requestRejected'));
    } catch (err) {
      console.error('Failed to reject request:', err);
      showError(t('dashboardWorkspace.toasts.requestRejectFailed'));
    }
  };

  const handleRequestToBlacklist = async (userId: string) => {
    if (!workspaceId) return;
    try {
      await WorkspaceService.banMember(workspaceId, userId.toString());
      await reloadWorkspaceData();

      // Sync workspace chat after banning
      await syncWorkspaceChat();
    } catch (err) {
      console.error('Failed to ban user:', err);
      showError(t('dashboardWorkspace.toasts.userBanFailed'));
    }
  };

  const handleCancelInvitation = async (userId: string) => {
    if (!workspaceId) return;
    try {
      const invitation = invites.find(invite => invite.user_id === userId);
      if (!invitation || !invitation.request_id) {
        showError(t('dashboardWorkspace.toasts.invitationNotFound'));
        return;
      }

      await WorkspaceService.rejectInvitation(invitation.request_id);
      await reloadWorkspaceData();
      showSuccess(t('dashboardWorkspace.toasts.invitationCancelled'));
    } catch (err) {
      console.error('Failed to cancel invitation:', err);
      showError(t('dashboardWorkspace.toasts.invitationCancelFailed'));
    }
  };

  const handleBanUser = async (userId: string, requestId?: string) => {
    if (!workspaceId) return;
    try {
      if (requestId) {
        await WorkspaceService.banUser(workspaceId, requestId);
      } else {
        await WorkspaceService.banUser(workspaceId, undefined, userId);
      }
      await reloadWorkspaceData();
      showSuccess(t('dashboardWorkspace.toasts.userBanned'));
    } catch (err) {
      console.error('Failed to ban user:', err);
      showError(t('dashboardWorkspace.toasts.userBanFailed'));
    }
  };

  const handleUnbanAndKick = async (userId: string) => {
    if (!workspaceId) return;
    try {
      await WorkspaceService.unbanUser(workspaceId, userId, 'remove');
      await reloadWorkspaceData();
      showSuccess(t('dashboardWorkspace.toasts.unbanAndKickSuccess'));
    } catch (err) {
      console.error('Failed to unban and kick user:', err);
      showError(t('dashboardWorkspace.toasts.unbanAndKickFailed'));
    }
  };

  const handleUnbanAndBack = async (userId: string) => {
    if (!workspaceId) return;
    try {
      await WorkspaceService.unbanUser(workspaceId, userId, 'unban');
      await reloadWorkspaceData();

      // Sync workspace chat after unbanning
      await syncWorkspaceChat();

      showSuccess(t('dashboardWorkspace.toasts.unbanAndRestoreSuccess'));
    } catch (err) {
      console.error('Failed to unban user:', err);
      showError(t('dashboardWorkspace.toasts.unbanAndRestoreFailed'));
    }
  };

  const handleSaveName = async (newName: string) => {
    if (!workspaceId) return;
    try {
      await WorkspaceService.updateWorkspace(workspaceId, { name: newName });
      await reloadWorkspaceData();
      setIsEditingName(false);
    } catch (err) {
      console.error('Failed to update workspace name:', err);
      showError(t('dashboardWorkspace.toasts.nameUpdateFailed'));
    }
  };

  const handleSaveDescription = async (newDescription: string) => {
    if (!workspaceId) return;
    try {
      await WorkspaceService.updateWorkspace(workspaceId, {
        description: newDescription,
      });
      await reloadWorkspaceData();
      setIsEditingDescription(false);
    } catch (err) {
      console.error('Failed to update workspace description:', err);
      showError(t('dashboardWorkspace.toasts.descriptionUpdateFailed'));
    }
  };

  const handleSetPassword = async () => {
    if (!workspaceId || !newPassword.trim()) return;

    try {
      await WorkspaceService.updateWorkspace(workspaceId, {
        password: newPassword.trim(),
      });
      await reloadWorkspaceData();
      setIsPasswordModalOpen(false);
      setNewPassword('');
      showSuccess(
        hasPassword
          ? t('dashboardWorkspace.toasts.passwordChanged')
          : t('dashboardWorkspace.toasts.passwordSet')
      );
    } catch (err) {
      console.error('Failed to set password:', err);
      showError(t('dashboardWorkspace.toasts.passwordSetFailed'));
    }
  };

  const handleRemovePassword = async () => {
    if (!workspaceId) return;

    try {
      await WorkspaceService.updateWorkspace(workspaceId, {
        password: '',
      });
      await reloadWorkspaceData();
      showSuccess(t('dashboardWorkspace.toasts.passwordRemoved'));
    } catch (err) {
      console.error('Failed to remove password:', err);
      showError(t('dashboardWorkspace.toasts.passwordRemoveFailed'));
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!workspaceId) return;

    try {
      // If current user is owner, prompt for new owner id
      if (currentUserRole === 'owner') {
        // Open modal to let owner pick a new owner instead of using prompt
        setIsTransferOwnerModalOpen(true);
        return;
      }

      await WorkspaceService.leaveWorkspace(workspaceId);

      showSuccess(t('dashboardWorkspace.toasts.leftWorkspace'));

      // After leaving, navigate to workspace list/home (SPA navigation so socket/hooks can cleanup)
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to leave workspace:', err);
      showError(t('dashboardWorkspace.toasts.leaveWorkspaceFailed'));
    }
  };

  const confirmLeaveWithNewOwner = async (newOwnerId: string) => {
    if (!workspaceId) return;
    try {
      if (!newOwnerId) {
        showError(t('dashboardWorkspace.toasts.ownerLeaveRequiresNewOwner'));
        return;
      }

      setIsTransferOwnerModalOpen(false);

      await WorkspaceService.leaveWorkspace(workspaceId, newOwnerId);

      showSuccess(t('dashboardWorkspace.toasts.leftWorkspace'));

      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to leave workspace with transfer:', err);
      showError(t('dashboardWorkspace.toasts.leaveWorkspaceFailed'));
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId) return;

    try {
      await WorkspaceService.deleteWorkspace(workspaceId);
      showSuccess(t('dashboardWorkspace.toasts.workspaceDeleted'));
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to delete workspace:', err);
      showError(t('dashboardWorkspace.toasts.deleteWorkspaceFailed'));
    }
  };

  const handleOpenPermissionModal = (member: any) => {
    console.log('Opening permission modal for member:', member);
    if (
      currentUser &&
      (member.user_id === currentUser._id || member.id === currentUser._id)
    ) {
      console.log('🚫 Cannot manage permissions for yourself');
      return;
    }

    setSelectedMember(member);
    setIsPermissionModalOpen(true);
  };

  const handleClosePermissionModal = () => {
    setIsPermissionModalOpen(false);
    setSelectedMember(null);
  };

  const handleOpenInviteMembersModal = () => {
    setIsInviteMembersModalOpen(true);
  };

  const handleCloseInviteMembersModal = () => {
    setIsInviteMembersModalOpen(false);
  };

  const handleInviteMembers = async (
    userIds: string[]
  ): Promise<{
    successful: { email: string; requestId: string }[];
    failed: { email: string; reason: string }[];
    summary: { total: number; successful: number; failed: number };
  }> => {
    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    try {
      const result = await WorkspaceService.inviteMultipleUsers(
        workspaceId,
        userIds
      );
      await reloadWorkspaceData();
      return result;
    } catch (error) {
      console.error('Error inviting members:', error);
      throw error;
    }
  };

  const handleUpdatePermissions = async (
    userId: string,
    permissions: string[],
    action: 'grant' | 'revoke' | 'set' = 'set'
  ) => {
    if (!workspaceId) return;

    try {
      await WorkspaceService.manageMemberPermissions(
        workspaceId,
        userId,
        permissions,
        action
      );

      // Calculate new permissions based on action
      let newPermissions: string[] = [];

      // Find current member
      const currentMember = members.find(m => m.user_id === userId);
      const currentPermissions = [...(currentMember?.permissions || [])];

      // Handle note permission actions
      if (permissions.includes('MANAGE_NOTES')) {
        if (action === 'grant' || action === 'set') {
          // Add note_admin, remove note_user
          newPermissions = currentPermissions.filter(p => p !== 'note_user');
          if (!newPermissions.includes('note_admin')) {
            newPermissions.push('note_admin');
          }
        } else if (action === 'revoke') {
          // Remove note_admin, add note_user
          newPermissions = currentPermissions.filter(p => p !== 'note_admin');
          if (!newPermissions.includes('note_user')) {
            newPermissions.push('note_user');
          }
        }
      } else if (action === 'set') {
        // For regular permission updates
        newPermissions = permissions;
      }

      // Update workspace detail state
      setWorkspaceDetail(prevDetail => {
        if (!prevDetail) return prevDetail;

        const updatedMembers = prevDetail.members.active.map(member =>
          member.user_id === userId
            ? { ...member, permissions: newPermissions }
            : member
        );

        return {
          ...prevDetail,
          members: {
            ...prevDetail.members,
            active: updatedMembers,
          },
        };
      });

      // Update selectedMember if it's the same user
      if (selectedMember && selectedMember.user_id === userId) {
        setSelectedMember((prevSelected: any) => ({
          ...prevSelected,
          permissions: newPermissions,
        }));
      }

      showSuccess(t('dashboardWorkspace.toasts.permissionsUpdated'));
    } catch (err) {
      console.error('Failed to update permissions:', err);
      showError(t('dashboardWorkspace.toasts.permissionsUpdateFailed'));
    }
  };

  const mapUserDetailToUser = (userDetail: UserDetailDto) => {
    return {
      id: userDetail.user_id,
      user_id: userDetail.user_id,
      name: userDetail.full_name || userDetail.email.split('@')[0],
      full_name: userDetail.full_name || userDetail.email.split('@')[0],
      email: userDetail.email,
      avatar: userDetail.avatar_url || '👤',
      role:
        userDetail.role === 'admin' ? ('Admin' as const) : ('Member' as const),
      rawRole: userDetail.role,
      isOwner: false,
      bannedDate:
        userDetail.status === 'banned'
          ? new Date(userDetail.time).toLocaleDateString('vi-VN')
          : undefined,
      permissions: userDetail.permissions || [],
    };
  };

  const filteredMembers = members
    .filter(member => {
      const matchesRole =
        memberRoleFilter === 'All' ||
        (memberRoleFilter === 'Admin' && member.role === 'admin') ||
        (memberRoleFilter === 'Member' && member.role !== 'admin');
      const matchesSearch =
        memberSearchTerm === '' ||
        (member.full_name || '')
          .toLowerCase()
          .includes(memberSearchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(memberSearchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    })
    .map(mapUserDetailToUser);

  const filteredRequests = requests
    .filter(request => {
      return (
        requestSearchTerm === '' ||
        (request.full_name || '')
          .toLowerCase()
          .includes(requestSearchTerm.toLowerCase())
      );
    })
    .map(mapUserDetailToUser);

  const filteredInvites = invites
    .filter(invite => {
      return (
        inviteSearchTerm === '' ||
        (invite.full_name || '')
          .toLowerCase()
          .includes(inviteSearchTerm.toLowerCase())
      );
    })
    .map(mapUserDetailToUser);

  const filteredBanned = banned
    .filter(user => {
      return (
        bannedSearchTerm === '' ||
        (user.full_name || '')
          .toLowerCase()
          .includes(bannedSearchTerm.toLowerCase())
      );
    })
    .map(mapUserDetailToUser);

  return {
    activeTab,
    setActiveTab,
    openMenuId,
    setOpenMenuId,
    isEditingName,
    setIsEditingName,
    isEditingDescription,
    setIsEditingDescription,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    hasPassword,
    newPassword,
    setNewPassword,
    isPermissionModalOpen,
    setIsPermissionModalOpen,
    selectedMember,
    isInviteMembersModalOpen,

    memberRoleFilter,
    setMemberRoleFilter,
    memberSearchTerm,
    setMemberSearchTerm,
    requestSearchTerm,
    setRequestSearchTerm,
    inviteSearchTerm,
    setInviteSearchTerm,
    bannedSearchTerm,
    setBannedSearchTerm,
    isRoleDropdownOpen,
    setIsRoleDropdownOpen,

    workspace,
    workspaceDetail,
    loading,
    error,
    currentUserRole,
    ownerId,
    filteredMembers,
    filteredRequests,
    filteredInvites,
    filteredBanned,
    requests,
    invites,

    toasts,
    removeToast,
    showSuccess,
    showError,

    loadWorkspaceData,
    reloadWorkspaceData,
    handleUpRole,
    handleKick,
    handleToBlacklist,
    handleAccept,
    handleReject,
    handleRequestToBlacklist,
    handleCancelInvitation,
    handleBanUser,
    handleUnbanAndKick,
    handleUnbanAndBack,
    handleSaveName,
    handleSaveDescription,
    handleSetPassword,
    handleRemovePassword,
    handleOpenPermissionModal,
    handleClosePermissionModal,
    handleUpdatePermissions,
    handleOpenInviteMembersModal,
    handleCloseInviteMembersModal,
    handleInviteMembers,
    handleLeaveWorkspace,
    handleDeleteWorkspace,
    isTransferOwnerModalOpen,
    setIsTransferOwnerModalOpen,
    confirmLeaveWithNewOwner,
  };
};

export default useWorkspaceManagement;
