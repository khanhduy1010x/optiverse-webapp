import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import FriendService from '../../services/friend.service';
import {
  setFriends,
  setSentRequests,
  setPendingRequests,
  setUser,
  setError,
  setLoading,
  setSearchedUsers,
  addFriend,
  acceptFriend,
  cancelFriendRequest,
  removeFriend,
} from '../../store/slices/friend.slice';
import { useTranslation } from 'react-i18next';

export function useFriendList() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const {
    friends,
    sentRequests,
    pendingRequests,
    searchedUsers,
    users,
    error,
    loading,
  } = useSelector((state: RootState) => state.friend);

  const userId =
    useSelector((state: RootState) => state.auth?.user?.userId) ||
    localStorage.getItem('userId') ||
    '';
  const [searchEmail, setSearchEmail] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [localSentRequests, setLocalSentRequests] = useState<any[]>([]);
  const [localPendingRequests, setLocalPendingRequests] = useState<any[]>([]);
  const MAX_FETCH_ATTEMPTS = 3;

  // Các hàm fetch chính: fetchData, fetchSentRequests, fetchPendingRequests...
  const fetchUserBatch = async (userIds: string[]) => {
    const uniqueUserIds = userIds.filter(
      (id, index) => userIds.indexOf(id) === index
    );
    const batchSize = 5;
    for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
      const batch = uniqueUserIds.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async id => {
          try {
            const user = await FriendService.getUserById(id);
            if (user) dispatch(setUser(user));
          } catch (err) {
            console.error(`Failed to fetch user ${id}:`, err);
          }
        })
      );
    }
  };

  const fetchPendingRequests = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const pendingList = await FriendService.viewAllPending();
      setLocalPendingRequests(pendingList || []);
      await fetchUserBatch(pendingList.map(r => r.user_id));
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchSentRequests = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const sentList = await FriendService.viewAllSent();
      setLocalSentRequests(sentList || []);
      await fetchUserBatch(sentList.map(r => r.friend_id));
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    if (!userId || fetchAttempts >= MAX_FETCH_ATTEMPTS) return;

    try {
      dispatch(setLoading(true));
      const [friendList, sentList, pendingList] = await Promise.all([
        FriendService.viewAllFriends(),
        FriendService.viewAllSent(),
        FriendService.viewAllPending(),
      ]);

      dispatch(setFriends(friendList || []));
      dispatch(setSentRequests(sentList || []));
      dispatch(setPendingRequests(pendingList || []));

      await fetchUserBatch([
        ...friendList.map(f => f.friend_id),
        ...sentList.map(s => s.friend_id),
        ...pendingList.map(p => p.user_id),
      ]);

      setFetchAttempts(0);
      if (error) dispatch(setError(null));
    } catch (err) {
      setFetchAttempts(prev => prev + 1);
      dispatch(
        setError(
          fetchAttempts >= MAX_FETCH_ATTEMPTS - 1
            ? t('Failed to fetch data after multiple attempts')
            : t('Failed to fetch data, retrying...')
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [userId, dispatch, t, fetchAttempts, error]);

  // Các hàm xử lý hành động
  const handleAddFriend = async (friendId: string) => {
    if (!friendId || friendId === 'undefined') {
      dispatch(setError(t('Invalid friend ID')));
      return;
    }

    try {
      dispatch(setLoading(true));
      const newFriend = await FriendService.addFriend(friendId);
      const friendUser = searchedUsers.find(
        user => user.userId === friendId || user._id === friendId
      );

      if (friendUser) {
        dispatch(setUser(friendUser));
        dispatch(addFriend({ ...newFriend }));
        dispatch(setError(null));
      }

      setActiveTab('sent');
      await fetchSentRequests();
    } catch (err) {
      dispatch(setError(t('Failed to add friend')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAcceptFriend = async (friendId: string) => {
    try {
      dispatch(setLoading(true));
      const accepted = await FriendService.acceptFriend(friendId);
      if (accepted) {
        dispatch(acceptFriend(accepted));
        setLocalPendingRequests(prev =>
          prev.filter(r => r._id !== accepted._id)
        );
        dispatch(setError(null));
      }
      setActiveTab('friends');
      await fetchData();
      await fetchPendingRequests();
    } catch (err) {
      dispatch(setError(t('Failed to accept friend')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCancelFriendRequest = async (friendId: string) => {
    try {
      dispatch(setLoading(true));
      const canceled = await FriendService.cancelFriendRequest(friendId);
      if (canceled) {
        dispatch(cancelFriendRequest(canceled._id));
        setLocalSentRequests(prev => prev.filter(r => r._id !== canceled._id));
        dispatch(setError(null));
      }
      await fetchSentRequests();
    } catch (err) {
      dispatch(setError(t('Failed to cancel friend request')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      dispatch(setLoading(true));
      const removed = await FriendService.removeFriend(friendId);
      if (removed) {
        dispatch(removeFriend(removed._id));
        dispatch(setError(null));
      }
      await fetchData();
    } catch (err) {
      dispatch(setError(t('Failed to remove friend')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearchUser = async () => {
    try {
      dispatch(setLoading(true));
      const user = await FriendService.searchUserByEmail(searchEmail);
      if (user) {
        if (!user.userId && user._id) user.userId = user._id;
        dispatch(setSearchedUsers([user]));
        dispatch(setUser(user));
        dispatch(setError(null));
      } else {
        dispatch(setSearchedUsers([]));
        dispatch(setError(t('User not found')));
      }
    } catch (err) {
      dispatch(setError(t('Failed to search user')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const forceRefreshAllData = () => {
    FriendService.clearCache(); // Clear all cached data
    setFetchAttempts(0);
    fetchData(); // Gọi ngay lập tức
    fetchSentRequests(); // Tải lại sent requests
    fetchPendingRequests(); // Tải lại pending requests
  };

  return {
    t,
    userId,
    friends,
    sentRequests,
    pendingRequests,
    searchedUsers,
    users,
    error,
    loading,
    activeTab,
    currentUser,
    localPendingRequests,
    localSentRequests,
    searchEmail,
    setSearchEmail,
    setActiveTab,
    fetchData,
    fetchSentRequests,
    fetchPendingRequests,
    handleAddFriend,
    handleAcceptFriend,
    handleCancelFriendRequest,
    handleRemoveFriend,
    handleSearchUser,
    dispatch,
    forceRefreshAllData
  };
}
