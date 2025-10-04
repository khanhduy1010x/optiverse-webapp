import { useEffect, useState, useCallback, useRef } from 'react';
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
import { useAppTranslate } from '../../hooks/useAppTranslate';

export function useFriendList() {
  const { t } = useAppTranslate('friend');
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
  const MAX_FETCH_ATTEMPTS = 3;

  // Tracking refreshes
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

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
      dispatch(setPendingRequests(pendingList || []));
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
      dispatch(setSentRequests(sentList || []));
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
            ? t('failed_to_fetch_data_after_multiple_attempts')
            : t('failed_to_fetch_data_retrying')
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [userId, dispatch, t, fetchAttempts, error]);

  // Các hàm xử lý hành động
  const handleAddFriend = async (friendId: string) => {
    if (!friendId || friendId === 'undefined') {
      dispatch(setError(t('invalid_friend_id')));
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
      await fetchSentRequests(); // Gọi API để lấy dữ liệu mới từ backend
    } catch (err) {
      dispatch(setError(t('failed_to_add_friend')));
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
        // Sau khi chấp nhận, cập nhật dữ liệu mới từ backend
        await fetchPendingRequests();
        dispatch(setError(null));
      }
      setActiveTab('friends');
      await fetchData(); // Tải lại tất cả dữ liệu
    } catch (err) {
      dispatch(setError(t('failed_to_accept_friend')));
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
        // Cập nhật dữ liệu sau khi hủy request
        await fetchSentRequests();
        dispatch(setError(null));
      }
    } catch (err) {
      dispatch(setError(t('failed_to_cancel_friend_request')));
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
      await fetchData(); // Tải lại dữ liệu bạn bè
    } catch (err) {
      dispatch(setError(t('failed_to_remove_friend')));
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
      }
    } catch (err) {
      dispatch(setError(t('failed_to_search_user')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const forceRefreshAllData = async () => {
    try {
      dispatch(setLoading(true));

      // Xóa cache để đảm bảo lấy dữ liệu mới
      FriendService.clearCache();
      setFetchAttempts(0);

      console.log('Force refreshing data for tab:', activeTab);

      // Gọi API dựa trên tab hiện tại
      if (activeTab === 'friends') {
        const friendList = await FriendService.viewAllFriends();

        // Kiểm tra xem có thay đổi không
        const hasChanges =
          JSON.stringify(friendList) !== JSON.stringify(friends);

        dispatch(setFriends(friendList || []));
        await fetchUserBatch(friendList.map(f => f.friend_id));

        return {
          tab: 'friends',
          hasChanges,
          count: friendList.length,
        };
      } else if (activeTab === 'pending') {
        const pendingList = await FriendService.viewAllPending();

        // Kiểm tra xem có thay đổi không
        const hasChanges =
          JSON.stringify(pendingList) !== JSON.stringify(pendingRequests);

        dispatch(setPendingRequests(pendingList || []));
        await fetchUserBatch(pendingList.map(p => p.user_id));

        return {
          tab: 'pending',
          hasChanges,
          count: pendingList.length,
        };
      } else if (activeTab === 'sent') {
        const sentList = await FriendService.viewAllSent();

        // Kiểm tra xem có thay đổi không
        const hasChanges =
          JSON.stringify(sentList) !== JSON.stringify(sentRequests);

        dispatch(setSentRequests(sentList || []));
        await fetchUserBatch(sentList.map(s => s.friend_id));

        return {
          tab: 'sent',
          hasChanges,
          count: sentList.length,
        };
      } else if (activeTab === 'search' && searchedUsers?.length > 0) {
        // Nếu đang ở tab search và có kết quả tìm kiếm, cập nhật trạng thái của các người dùng
        const [friendList, sentList, pendingList] = await Promise.all([
          FriendService.viewAllFriends(),
          FriendService.viewAllSent(),
          FriendService.viewAllPending(),
        ]);

        // Kiểm tra xem có thay đổi không
        const hasChanges =
          JSON.stringify(friendList) !== JSON.stringify(friends) ||
          JSON.stringify(sentList) !== JSON.stringify(sentRequests) ||
          JSON.stringify(pendingList) !== JSON.stringify(pendingRequests);

        dispatch(setFriends(friendList || []));
        dispatch(setSentRequests(sentList || []));
        dispatch(setPendingRequests(pendingList || []));

        return {
          tab: 'search',
          hasChanges,
          friendsCount: friendList.length,
          sentCount: sentList.length,
          pendingCount: pendingList.length,
        };
      }

      dispatch(setError(null));
      return { tab: activeTab, hasChanges: false };
    } catch (error) {
      console.error('Error refreshing data:', error);
      dispatch(setError(t('failed_to_refresh_data')));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Auto-refresh data khi tab thay đổi
  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingRequests();
    } else if (activeTab === 'sent') {
      fetchSentRequests();
    } else if (activeTab === 'friends') {
      fetchData();
    }
  }, [activeTab
    // , fetchPendingRequests, fetchSentRequests, fetchData
    // bug loop refresh, please fix it
  ]);

  // Thiết lập polling để làm mới dữ liệu định kỳ
  useEffect(() => {
    // Xóa interval cũ nếu có
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }

    // Thiết lập interval mới - cập nhật mỗi 30 giây
    refreshInterval.current = setInterval(() => {
      // Kiểm tra tab hiện tại và làm mới dữ liệu tương ứng
      if (activeTab === 'pending') {
        fetchPendingRequests();
      } else if (activeTab === 'sent') {
        fetchSentRequests();
      } else if (activeTab === 'friends') {
        fetchData();
      }
    }, 30000); // 30 giây

    // Cleanup khi component unmount
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [activeTab, fetchData, fetchPendingRequests, fetchSentRequests]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

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
    forceRefreshAllData,
  };
}
