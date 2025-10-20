import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import workspaceService from '../../services/workspace.service';
import { getAllWorkspaces } from '../../store/slices/workspaceslice';
import { AppDispatch } from '../../store';

type TabType = 'search' | 'invitations' | 'requests';

interface WorkspaceSearchResult {
  id: string;
  name: string;
  description?: string;
  hasPassword: boolean;
  memberCount: number;
  owner: {
    user_id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
  userStatus?:
    | 'none'
    | 'member'
    | 'pending_request'
    | 'pending_invitation'
    | 'banned'
    | 'owner';
}

interface InvitationItem {
  requestId: string;
  type: 'invite';
  message?: string;
  createdAt: string;
  workspace: {
    id: string;
    name: string;
    description: string;
    hasPassword: boolean;
    memberCount: number;
    owner: {
      user_id: string;
      email: string;
      full_name?: string;
      avatar_url?: string;
    } | null;
  };
  requester: {
    user_id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

interface RequestItem {
  requestId: string;
  type: 'request';
  message?: string;
  createdAt: string;
  workspace: {
    id: string;
    name: string;
    description: string;
    hasPassword: boolean;
    memberCount: number;
    owner: {
      user_id: string;
      email: string;
      full_name?: string;
      avatar_url?: string;
    } | null;
  };
  requester: {
    user_id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

const useWorkspaceHub = (onCloseModal?: () => void) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Tab management
  const [activeTab, setActiveTab] = useState<TabType>('search');

  // Search functionality
  const [searchCode, setSearchCode] = useState('');
  const [searchResults, setSearchResults] = useState<WorkspaceSearchResult[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);

  // Invitations data
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);

  // Requests data
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Password functionality
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceSearchResult | null>(null);
  const [passwordError, setPasswordError] = useState('');

  // Search functions
  const handleSearch = async () => {
    if (!searchCode.trim()) return;

    setIsSearching(true);
    try {
      const result = await workspaceService.searchWorkspace(searchCode);
      // Convert single workspace result to array for consistent handling
      setSearchResults([
        {
          id: result.workspace.id,
          name: result.workspace.name,
          description: result.workspace.description,
          hasPassword: result.workspace.hasPassword,
          memberCount: result.workspace.memberCount,
          owner: result.workspace.owner,
          userStatus: result.workspace.userStatus,
        },
      ]);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchCode('');
    setSearchResults([]);
  };

  // Password functions
  const openPasswordModal = (workspace: WorkspaceSearchResult) => {
    setSelectedWorkspace(workspace);
    setShowPasswordModal(true);
    setPassword('');
    setPasswordError('');
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setSelectedWorkspace(null);
    setPasswordError('');
  };

  const handlePasswordSubmit = async () => {
    if (!selectedWorkspace || !password.trim()) return;

    setPasswordError('');
    try {
      await workspaceService.joinWorkspaceWithPassword(searchCode, password);
      console.log('Successfully joined workspace:', selectedWorkspace.name);
      closePasswordModal();

      // Close main modal
      onCloseModal?.();

      // Fetch updated workspaces
      await dispatch(getAllWorkspaces());

      // Navigate to the workspace
      navigate(`/workspace/${selectedWorkspace.id}/dashboard`);
    } catch (error: any) {
      console.error('Failed to join workspace:', error);
      if (error.response?.data?.code === 1004) {
        setPasswordError('Incorrect password. Please try again.');
      } else {
        setPasswordError('Failed to join workspace. Please try again.');
      }
    }
  };

  const handleRequestJoin = async (workspace: WorkspaceSearchResult) => {
    try {
      await workspaceService.joinWorkspace({
        invite_code: searchCode,
        message: '', // Could add message input later
      });
      console.log('Successfully sent join request for:', workspace.name);

      // Switch to requests tab to show the new request
      setActiveTab('requests');

      // Load requests to show updated list
      await loadRequests();
    } catch (error) {
      console.error('Failed to send join request:', error);
      // TODO: Show error message to user
    }
  };

  // Invitations functions
  const loadInvitations = async () => {
    setIsLoadingInvitations(true);
    try {
      const result = await workspaceService.getMyInvitations();
      setInvitations(result as unknown as InvitationItem[]);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      setInvitations([]);
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      // Find the invitation to get workspace info
      const invitation = invitations.find(
        inv => inv.requestId === invitationId
      );

      await workspaceService.acceptInvitation(invitationId);
      console.log('Successfully accepted invitation:', invitationId);

      // Close main modal
      onCloseModal?.();

      // Fetch updated workspaces
      await dispatch(getAllWorkspaces());

      // Navigate to the workspace if we have the workspace info
      if (invitation?.workspace?.id) {
        navigate(`/workspace/${invitation.workspace.id}/dashboard`);
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      // TODO: Show error message to user
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    try {
      await workspaceService.rejectInvitation(invitationId);
      await loadInvitations(); // Reload invitations
    } catch (error) {
      console.error('Failed to reject invitation:', error);
    }
  };

  // Requests functions
  const loadRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const result = await workspaceService.getMyRequests();
      setRequests(result as unknown as RequestItem[]);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      await workspaceService.cancelRequest(requestId);
      await loadRequests(); // Reload requests
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  };

  // Tab change handler
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);

    // Reset search states when switching away from search tab
    if (tab !== 'search') {
      setSearchCode('');
      setSearchResults([]);
      setPasswordError('');
    }

    // Load data when switching tabs
    switch (tab) {
      case 'invitations':
        loadInvitations();
        break;
      case 'requests':
        loadRequests();
        break;
      default:
        break;
    }
  };

  return {
    // Tab state
    activeTab,
    setActiveTab: handleTabChange,

    // Search state and functions
    searchCode,
    setSearchCode,
    searchResults,
    isSearching,
    handleSearch,
    clearSearch,

    // Password state and functions
    showPasswordModal,
    password,
    setPassword,
    selectedWorkspace,
    passwordError,
    openPasswordModal,
    closePasswordModal,
    handlePasswordSubmit,
    handleRequestJoin,

    // Invitations state and functions
    invitations,
    isLoadingInvitations,
    loadInvitations,
    acceptInvitation,
    rejectInvitation,

    // Requests state and functions
    requests,
    isLoadingRequests,
    loadRequests,
    cancelRequest,
  };
};

export default useWorkspaceHub;
