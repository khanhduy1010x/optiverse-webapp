import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getAllWorkspaces } from '../../store/slices/workspaceslice';
import {
  selectWorkspaceForDropdown,
  selectWorkspaceLoadingState,
  selectOwnerWorkspaceNames,
  selectMemberWorkspaceNames,
} from '../../store/selector/workspace.selector';

export const useDropDownWorkspace = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [selectedWorkspace, setSelectedWorkspace] = useState('Home');
  const [isShowCreate, setIsShowCreate] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get data from Redux store
  const workspaces = useAppSelector(selectWorkspaceForDropdown);
  const ownerWorkspaces = useAppSelector(selectOwnerWorkspaceNames);
  const memberWorkspaces = useAppSelector(selectMemberWorkspaceNames);
  const { loading: isLoadingWorkspaces } = useAppSelector(
    selectWorkspaceLoadingState
  );

  console.log('Owner Workspaces:', ownerWorkspaces);
  console.log('Member Workspaces:', memberWorkspaces);
  // Fetch workspaces on mount
  useEffect(() => {
    dispatch(getAllWorkspaces());
    console.log(workspaces);
  }, [dispatch, isDropdownOpen]);

  // Handlers
  const onToggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const onCloseDropdown = () => setIsDropdownOpen(false);

  const onSelectWorkspace = (workspace: { id: string; name: string }) => {
    setSelectedWorkspace(workspace.name);
    setIsDropdownOpen(false);
    if (workspace.id === 'home') {
      navigate('/dashboard');
    } else {
      navigate(`/workspace/${workspace.id}/dashboard`);
    }
  };

  const onHomeClick = () => {
    setSelectedWorkspace('Home');
    navigate('/dashboard');
  };

  // Refresh workspaces method
  const refreshWorkspaces = () => {
    dispatch(getAllWorkspaces());
  };

  // Handle workspace creation success
  const onWorkspaceCreated = (workspaceId: string, workspaceName: string) => {
    setIsShowCreate(false);
    setSelectedWorkspace(workspaceName);
    refreshWorkspaces();
    navigate(`/workspace/${workspaceId}/dashboard`);
  };

  return {
    // State
    selectedWorkspace,
    isDropdownOpen,
    workspaces,
    ownerWorkspaces,
    memberWorkspaces,
    isLoadingWorkspaces,
    isShowCreate,

    // Handlers
    onToggleDropdown,
    onCloseDropdown,
    onSelectWorkspace,
    onHomeClick,
    refreshWorkspaces,
    setIsShowCreate,
    onWorkspaceCreated,
  };
};

export default useDropDownWorkspace;
