import { useMemo, useState, useEffect } from 'react';
import type { Friend } from '../../types/workspace/workspace.props';
import workspaceService from '../../services/workspace.service';
import { CreateWorkspaceDto } from '../../types/workspace/request/workspace.request';
import FriendService from '../../services/friend.service';
import { useAppDispatch } from '../../store/hooks';
import {
  getAllWorkspaces,
  setWorkspaces,
} from '../../store/slices/workspaceslice';

export const useCreateWorkspaceHook = (
  onSuccess?: (workspaceId: string, workspaceName: string) => void
) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [allFriends, setAllFriends] = useState<Friend[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoadingFriends(true);
      try {
        const friendsData = await FriendService.viewAllFriends();
        const mappedFriends: Friend[] = friendsData.map(friend => ({
          id: friend.friendInfo?.id || friend.friend_id || '',
          name: friend.friendInfo?.full_name || 'Unknown',
          email: friend.friendInfo?.email,
          avatarUrl: friend.friendInfo?.avatar_url,
        }));
        setAllFriends(mappedFriends);
      } catch (error) {
        console.error('Failed to fetch friends:', error);
        setAllFriends([]);
      } finally {
        setIsLoadingFriends(false);
      }
    };

    fetchFriends();
  }, []);

  // Mock friend directory - removed, now using real data
  // const allFriends: Friend[] = useMemo(
  //   () => [
  //     { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com' },
  //     ...
  //   ],
  //   []
  // );

  const lowerQuery = searchQuery.trim().toLowerCase();
  const selectedIds = new Set(selectedFriends.map(f => f.id));

  const friendResults: Friend[] = useMemo(() => {
    if (!lowerQuery) return allFriends.filter(f => !selectedIds.has(f.id));
    return allFriends.filter(f => {
      if (selectedIds.has(f.id)) return false;
      const target = `${f.name} ${f.email ?? ''}`.toLowerCase();
      return target.includes(lowerQuery);
    });
  }, [allFriends, lowerQuery, selectedIds]);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setName(e.target.value);
  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setDescription(e.target.value);
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);
  const onToggleHasPassword = (e: React.ChangeEvent<HTMLInputElement>) =>
    setHasPassword(e.target.checked);
  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);

  const onAddFriend = (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = (e.currentTarget as HTMLButtonElement).dataset.id;
    const friend = allFriends.find(f => f.id === id);
    if (friend && !selectedIds.has(friend.id)) {
      setSelectedFriends(prev => [...prev, friend]);
    }
  };

  const onRemoveFriend = (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = (e.currentTarget as HTMLButtonElement).dataset.id;
    if (!id) return;
    setSelectedFriends(prev => prev.filter(f => f.id !== id));
  };

  const onSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const createDto: CreateWorkspaceDto = {
        name: name.trim(),
        description: description?.trim() || undefined,
        password: hasPassword && password ? password : undefined,
        memberIds: selectedFriends.map(f => f.id), // Will create invitations instead of direct members
      };

      const newWorkspace = await workspaceService.createWorkspace(createDto);
      console.log('Workspace created successfully:', newWorkspace);
      // Note: Selected friends will receive invitations to join the workspace

      // Reset form
      setName('');
      setDescription('');
      setPassword('');
      setHasPassword(false);
      setSelectedFriends([]);
      setSearchQuery('');

      // Refresh workspaces in Redux
      dispatch(getAllWorkspaces());

      // Call success callback to close modal and redirect
      if (onSuccess) {
        onSuccess(newWorkspace._id, newWorkspace.name);
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
      // You might want to show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // state
    name,
    description,
    searchQuery,
    selectedFriends,
    friendResults,
    hasPassword,
    password,
    isLoadingFriends,
    isSubmitting,

    onSubmit,
    onNameChange,
    onDescriptionChange,
    onSearchChange,
    onToggleHasPassword,
    onPasswordChange,
    onAddFriend,
    onRemoveFriend,
  };
};

export default useCreateWorkspaceHook;
