import { useState, useEffect } from 'react';
import { RootItem } from '../../types/note/note.types';
import FriendService from '../../services/friend.service';
import ShareService from '../../services/share.service';
import { Friend } from '../../types/friend/response/friend.response';
import {
  SelectedUser,
  SharedWithUser,
  UserInfo,
} from '../../types/note/share.types';
import SocketService from '../../services/socket.service';

export const useShareNote = (
  isOpen: boolean,
  onClose: () => void,
  selectedItem: RootItem | null
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [currentlySharedWith, setCurrentlySharedWith] = useState<
    SharedWithUser[]
  >([]);
  const [loadingSharedInfo, setLoadingSharedInfo] = useState(false);

  const fetchFriends = async () => {
    if (isOpen) {
      setLoadingFriends(true);
      try {
        const friendsData = await FriendService.viewAllFriends();
        setFriends(friendsData);
      } catch (err) {
      } finally {
        setLoadingFriends(false);
      }
    }
  };

  const fetchSharedUsers = async () => {
    if (!selectedItem) return;

    setLoadingSharedInfo(true);
    try {
      const resourceType = selectedItem.type === 'file' ? 'note' : 'folder';
      const resourceId = selectedItem._id;

      const mySharedItems = await ShareService.getMySharedItems();

      const shareInfo = mySharedItems.find(
        item =>
          item.resource_type === resourceType && item.resource_id === resourceId
      );

      if (shareInfo && shareInfo.shared_with) {
        const sharedUsers: SharedWithUser[] = shareInfo.shared_with.map(
          user => {
            let userInfoData: UserInfo | null = null;
            if (user.user_info) {
              userInfoData = {
                id: user.user_info.id || user.user_id,
                name: user.user_info.name || 'Unknown',
                email: user.user_info.email || '',
                avatar_url: user.user_info.avatar_url,
              };
            }

            return {
              user_id: user.user_id,
              permission: user.permission as 'view' | 'edit',
              shared_at: user.shared_at,
              user_info: userInfoData,
            };
          }
        );

        setCurrentlySharedWith(sharedUsers);
      } else {
        setCurrentlySharedWith([]);
      }
    } catch (err) {
    } finally {
      setLoadingSharedInfo(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      fetchSharedUsers();
    }
  }, [isOpen, selectedItem]);

  const filteredFriends =
    searchTerm.trim() === ''
      ? []
      : friends.filter(friend => {
          const isAlreadyShared = currentlySharedWith.some(
            shared => shared.user_id === friend.friend_id
          );

          const isAlreadySelected = selectedUsers.some(
            selected => selected._id === friend.friend_id
          );

          if (isAlreadyShared || isAlreadySelected) return false;

          const fullName = friend.friendInfo?.full_name?.toLowerCase() || '';
          const email = friend.friendInfo?.email?.toLowerCase() || '';
          const term = searchTerm.toLowerCase();
          return fullName.includes(term) || email.includes(term);
        });

  const handleSelectUser = (friend: Friend) => {
    if (!selectedUsers.some(u => u._id === friend.friend_id)) {
      setSelectedUsers([
        ...selectedUsers,
        {
          _id: friend.friend_id,
          fullname: friend.friendInfo?.full_name || 'Unknown',
          email: friend.friendInfo?.email || '',
          avatar: friend.friendInfo?.avatar_url,
          permission: permission,
        },
      ]);
    }
    setSearchTerm('');
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
  };

  const handleUpdateUserPermission = (
    userId: string,
    newPermission: 'view' | 'edit'
  ) => {
    setSelectedUsers(
      selectedUsers.map(user =>
        user._id === userId ? { ...user, permission: newPermission } : user
      )
    );
  };

  const handleUpdateSharedUserPermission = async (
    userId: string,
    newPermission: 'view' | 'edit'
  ) => {
    if (!selectedItem) return;

    setShareLoading(true);
    try {
      const resourceType = selectedItem.type === 'file' ? 'note' : 'folder';
      const resourceId = selectedItem._id;

      const updatedSharedWith = currentlySharedWith.map(user => ({
        user_id: user.user_id,
        permission: user.user_id === userId ? newPermission : user.permission,
      }));

      await ShareService.updateSharedUsers(
        resourceType,
        resourceId,
        updatedSharedWith
      );

      setCurrentlySharedWith(
        currentlySharedWith.map(user =>
          user.user_id === userId
            ? { ...user, permission: newPermission }
            : user
        )
      );

      SocketService.emitFolderStructureChanged();
    } catch (err) {
      setShareError(
        err instanceof Error ? err.message : 'Failed to update permission'
      );
    } finally {
      setShareLoading(false);
    }
  };

  const handleRemoveSharedUser = async (userId: string) => {
    if (!selectedItem) return;

    setShareLoading(true);
    try {
      const resourceType = selectedItem.type === 'file' ? 'note' : 'folder';
      const resourceId = selectedItem._id;

      await ShareService.removeUserFromShare(resourceType, resourceId, userId);

      setCurrentlySharedWith(
        currentlySharedWith.filter(user => user.user_id !== userId)
      );

      if (resourceType === 'note') {
        SocketService.emitNoteUserRemoved(resourceId, userId);
      } else {
        SocketService.emitFolderUserRemoved(resourceId, userId);
      }

      SocketService.emitFolderStructureChanged();
    } catch (err) {
      setShareError(
        err instanceof Error ? err.message : 'Failed to remove user'
      );
    } finally {
      setShareLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedItem || selectedUsers.length === 0) return;

    setShareLoading(true);
    setShareError(null);

    try {
      const resourceType = selectedItem.type === 'file' ? 'note' : 'folder';
      const resourceId = selectedItem._id;

      await ShareService.shareResource(
        resourceType,
        resourceId,
        selectedUsers.map(user => ({
          user_id: user._id,
          permission: user.permission || permission,
        }))
      );

      selectedUsers.forEach(user => {
        if (resourceType === 'note') {
          SocketService.emitNoteShared(resourceId, user._id);
        } else {
          SocketService.emitFolderShared(resourceId, user._id);
        }
      });

      const newSharedUsers: SharedWithUser[] = selectedUsers.map(user => ({
        user_id: user._id,
        permission: user.permission || permission,
        shared_at: new Date().toISOString(),
        user_info: {
          id: user._id,
          name: user.fullname,
          email: user.email,
          avatar_url: user.avatar,
        },
      }));

      setCurrentlySharedWith([...currentlySharedWith, ...newSharedUsers]);
      setSelectedUsers([]);

      SocketService.emitFolderStructureChanged();

      onClose();
    } catch (err) {
      setShareError(
        err instanceof Error ? err.message : 'Failed to share item'
      );
    } finally {
      setShareLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedUsers,
    permission,
    setPermission,
    filteredFriends,
    loadingFriends,
    shareLoading,
    shareError,
    currentlySharedWith,
    loadingSharedInfo,
    fetchFriends,
    fetchSharedUsers,
    handleSelectUser,
    handleRemoveUser,
    handleShare,
    handleUpdateUserPermission,
    handleUpdateSharedUserPermission,
    handleRemoveSharedUser,
  };
};
