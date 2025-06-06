import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import FriendService from '../../services/friend.service';
import {
  setFriends,
  setSentRequests,
  setPendingRequests,
  setSearchedUsers,
  setError,
  setLoading,
  addFriend,
  acceptFriend,
  cancelFriendRequest,
  removeFriend,
  setUser,
} from '../../store/slices/friendSlice';
import { useTranslation } from 'react-i18next';
import {
  FriendSidebar,
  FriendHeader,
  AllFriends,
  PendingRequests,
  SentRequests,
  SearchUsers,
  ErrorDisplay
} from './components';

const FriendList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { friends, sentRequests, pendingRequests, searchedUsers, users, error, loading } = useSelector(
    (state: RootState) => state.friend
  );
  
  // Lấy userId từ Redux hoặc localStorage
  const userId = useSelector((state: RootState) => state.auth?.user?.userId) || localStorage.getItem('userId') || '';
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('friends');
  const [fetchAttempts, setFetchAttempts] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [localSentRequests, setLocalSentRequests] = useState<any[]>([]);
  const [localPendingRequests, setLocalPendingRequests] = useState<any[]>([]);
  const MAX_FETCH_ATTEMPTS = 3;

  // Lấy thông tin người dùng hiện tại
  useEffect(() => {
    if (userId) {
      const fetchCurrentUser = async () => {
        try {
          const userInfo = await FriendService.getUserById(userId);
          if (userInfo) {
            setCurrentUser(userInfo);
            dispatch(setUser(userInfo));
          }
        } catch (error) {
          console.error('Failed to fetch current user info:', error);
        }
      };
      fetchCurrentUser();
    }
  }, [userId, dispatch]);

  // Force refresh all data and clear cache
  const forceRefreshAllData = () => {
    FriendService.clearCache(); // Clear all cached data
    setFetchAttempts(0);
    fetchData(); // Gọi ngay lập tức
    fetchSentRequests(); // Tải lại sent requests
    fetchPendingRequests(); // Tải lại pending requests
  };

  // Hàm riêng để tải dữ liệu pending requests
  const fetchPendingRequests = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const pendingList = await FriendService.viewAllPending();
      console.log("Pending requests fetched directly:", pendingList);
      setLocalPendingRequests(pendingList || []);
      
      // Collect user IDs from pending requests
      const userIds = (pendingList || []).map((r) => r.user_id).filter(Boolean);
      
      // Fetch user data for pending requests
      const uniqueUserIds = userIds.filter((id, index) => userIds.indexOf(id) === index);
      const batchSize = 5;
      for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
        const batch = uniqueUserIds.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (id) => {
            try {
              const user = await FriendService.getUserById(id);
              if (user) {
                dispatch(setUser(user));
              }
            } catch (err) {
              console.error(`Failed to fetch user ${id}:`, err);
            }
          })
        );
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Hàm riêng để tải dữ liệu sent requests
  const fetchSentRequests = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const sentList = await FriendService.viewAllSent();
      console.log("Sent requests fetched directly:", sentList);
      setLocalSentRequests(sentList || []);
      
      // Collect user IDs from sent requests
      const userIds = (sentList || []).map((r) => r.friend_id).filter(Boolean);
      
      // Fetch user data for sent requests
      const uniqueUserIds = userIds.filter((id, index) => userIds.indexOf(id) === index);
      const batchSize = 5;
      for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
        const batch = uniqueUserIds.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (id) => {
            try {
              const user = await FriendService.getUserById(id);
              if (user) {
                dispatch(setUser(user));
              }
            } catch (err) {
              console.error(`Failed to fetch user ${id}:`, err);
            }
          })
        );
      }
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Memoize fetchData to prevent unnecessary recreations
  const fetchData = useCallback(async () => {
      if (!userId) {
        console.log('fetchData: userId không tồn tại, bỏ qua');
        return;
      }
    
    if (fetchAttempts >= MAX_FETCH_ATTEMPTS) {
      console.log('fetchData: Đã đạt số lần thử tối đa, bỏ qua');
      return; // Skip fetching if max attempts reached
    }
    
      console.log('fetchData: Bắt đầu tải dữ liệu');
      dispatch(setLoading(true));
      try {
      // Luôn lấy dữ liệu mới từ database
      console.log('fetchData: Gọi API viewAllFriends');
      
      // Use Promise.all to fetch data in parallel
      const [friendList, sentList, pendingList] = await Promise.all([
        FriendService.viewAllFriends(),
        FriendService.viewAllSent(),
        FriendService.viewAllPending()
      ]);
      
      console.log("fetchData: Dữ liệu bạn bè nhận được:", friendList);
      console.log("fetchData: Dữ liệu sent requests:", sentList);
      
      // Cập nhật state với dữ liệu mới
      dispatch(setFriends(friendList || []));
      dispatch(setSentRequests(sentList || []));
      dispatch(setPendingRequests(pendingList || []));

      // Collect all unique user IDs
        const userIds = [
        ...(friendList || []).map((f) => f.friend_id),
        ...(sentList || []).map((r) => r.friend_id),
        ...(pendingList || []).map((r) => r.user_id),
      ].filter(Boolean); // Loại bỏ các giá trị undefined hoặc null
      
      const uniqueUserIds = userIds.filter((id, index) => userIds.indexOf(id) === index); // More efficient way to get unique values
      
      // Fetch user data in batches to avoid too many parallel requests
      const batchSize = 5;
      for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
        const batch = uniqueUserIds.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (id) => {
          try {
            const user = await FriendService.getUserById(id);
              if (user) {
            dispatch(setUser(user));
              }
          } catch (err) {
            console.error(`Failed to fetch user ${id}:`, err);
              // Don't fail the entire operation for one user
            }
          })
        );
      }
      
      setFetchAttempts(0); // Reset attempts on success
      
      // Xóa thông báo lỗi nếu thành công
      if (error) {
        dispatch(setError(null));
        }
      } catch (err) {
      console.error('Error fetching friend data:', err);
      setFetchAttempts(prev => prev + 1);
      if (fetchAttempts >= MAX_FETCH_ATTEMPTS - 1) {
        dispatch(setError(t('Failed to fetch data after multiple attempts')));
      } else {
        dispatch(setError(t('Failed to fetch data, retrying...')));
      }
    } finally {
      dispatch(setLoading(false));
    }
  }, [userId, dispatch, t, fetchAttempts, error]);

  // Thay thế bằng useEffect mới để tải dữ liệu ban đầu và tự động làm mới
  useEffect(() => {
    // Tải dữ liệu ban đầu ngay khi component được mount
    const loadAllData = async () => {
      if (!userId) return;
      
      console.log('loadAllData: Component được mount, bắt đầu tải dữ liệu');
      dispatch(setLoading(true));
      try {
        console.log('loadAllData: Gọi trực tiếp API viewAllFriends');
        // Tải đồng thời tất cả dữ liệu cần thiết
        const friendList = await FriendService.viewAllFriends();
        const sentList = await FriendService.viewAllSent();
        const pendingList = await FriendService.viewAllPending();
        
        console.log('loadAllData: Nhận được dữ liệu bạn bè:', friendList);
        console.log('loadAllData: Nhận được dữ liệu sent requests:', sentList);
        console.log('loadAllData: Nhận được dữ liệu pending requests:', pendingList);
        
        // Cập nhật state Redux và local state
        dispatch(setFriends(friendList || []));
        dispatch(setSentRequests(sentList || []));
        dispatch(setPendingRequests(pendingList || []));
        
        setLocalSentRequests(sentList || []);
        setLocalPendingRequests(pendingList || []);
        
        // Tải thông tin người dùng
        const userIds = [
          ...(friendList || []).map((f) => f.friend_id),
          ...(sentList || []).map((r) => r.friend_id),
          ...(pendingList || []).map((r) => r.user_id),
        ].filter(Boolean);
        
        const uniqueUserIds = userIds.filter((id, index) => userIds.indexOf(id) === index);
        
        // Tải thông tin người dùng theo lô
        const batchSize = 5;
        for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
          const batch = uniqueUserIds.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (id) => {
              try {
                const user = await FriendService.getUserById(id);
                if (user) {
                  dispatch(setUser(user));
                }
              } catch (err) {
                console.error(`Failed to fetch user ${id}:`, err);
              }
            })
          );
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };
    
    // Gọi loadAllData ngay khi component mount
    loadAllData();
    
    // Thiết lập interval để làm mới dữ liệu mỗi 30 giây
    const intervalId = setInterval(() => {
      if (activeTab === 'friends') {
        console.log('Interval: Đã đến thời gian làm mới dữ liệu bạn bè');
        fetchData();
      } else if (activeTab === 'pending') {
        fetchPendingRequests();
      } else if (activeTab === 'sent') {
        fetchSentRequests();
      }
    }, 30000); // 30 giây
    
    // Cleanup khi component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [userId, dispatch, activeTab, fetchData, fetchSentRequests, fetchPendingRequests]);
  
  // useEffect riêng cho tab sent requests
  useEffect(() => {
    if (activeTab === 'sent') {
      fetchSentRequests();
    }
  }, [activeTab, fetchSentRequests]);
  
  // useEffect riêng cho tab pending requests
  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingRequests();
    }
  }, [activeTab, fetchPendingRequests]);
  
  // useEffect riêng cho tab friends
  useEffect(() => {
    if (activeTab === 'friends') {
      console.log('Tab friends được chọn, gọi fetchData');
      fetchData();
    }
  }, [activeTab, fetchData]);
  
  // UseEffect đặc biệt cho việc khởi tạo ban đầu
  useEffect(() => {
    // Đảm bảo chỉ chạy 1 lần khi component được mount
    console.log('Component FriendList vừa được mount lần đầu tiên');
    
    // Gọi API trực tiếp khi vừa vào trang, không phụ thuộc vào bất kỳ state nào
    if (activeTab === 'friends') {
      console.log('Tab mặc định là friends, gọi API trực tiếp');
      
      // Đảm bảo API được gọi ngay lập tức khi vừa load trang
      dispatch(setLoading(true));
      setTimeout(() => {
        FriendService.viewAllFriends()
          .then(friendList => {
            console.log('Kết quả API khi khởi tạo:', friendList);
            if (friendList && friendList.length > 0) {
              dispatch(setFriends(friendList));
            }
            dispatch(setLoading(false));
          })
          .catch(err => {
            console.error('Lỗi khi gọi API lúc khởi tạo:', err);
            dispatch(setLoading(false));
          });
      }, 100); // Trì hoãn một chút để đảm bảo component đã render
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dispatch]);

  // Render user info with name if available
  const renderUserInfo = (userId: string, showId: boolean = false) => {
    const user = users[userId];
    
    if (!user) return userId;
    
    return (
      <span className="flex flex-col">
        {(user as any).full_name ? (
          <>
            <span className="font-medium text-base">{(user as any).full_name}</span>
            <span className="text-sm text-gray-500">{user.email}</span>
          </>
        ) : (
        <span className="font-medium">{user.email}</span>
        )}
        {showId && <span className="text-xs text-gray-400">ID: {userId}</span>}
      </span>
    );
  };
  
  // Xử lý khi chuyển tab
  const handleTabChange = (tabKey: string) => {
    console.log('Tab đã chuyển sang:', tabKey);
    setActiveTab(tabKey);
    
    // Xóa cache và làm mới dữ liệu khi chuyển tab
    FriendService.clearCache();
    
    // Xóa kết quả tìm kiếm và thông báo lỗi khi chuyển tab
    if (tabKey !== 'search') {
      dispatch(setSearchedUsers([]));
      dispatch(setError(null));
      setSearchEmail('');
    }
    
    // Tải dữ liệu tương ứng với tab được chọn
    if (tabKey === 'sent') {
      console.log('Tab sent: Gọi fetchSentRequests');
      fetchSentRequests();
    } else if (tabKey === 'pending') {
      console.log('Tab pending: Gọi fetchPendingRequests');
      fetchPendingRequests();
    } else if (tabKey === 'friends') {
      console.log('Tab friends: Gọi fetchData và viewAllFriends trực tiếp');
      // Gọi trực tiếp API để đảm bảo request được gửi đi
      fetchData();
      
      // Gọi trực tiếp API và cập nhật state để đảm bảo
      dispatch(setLoading(true));
      FriendService.viewAllFriends()
        .then(friendList => {
          console.log('Kết quả trực tiếp từ viewAllFriends:', friendList);
          if (friendList && friendList.length > 0) {
            dispatch(setFriends(friendList));
          }
          dispatch(setLoading(false));
        })
        .catch(err => {
          console.error('Lỗi khi gọi trực tiếp viewAllFriends:', err);
          dispatch(setLoading(false));
        });
    } else {
      console.log('Tab khác: Gọi fetchData');
      fetchData();
    }
  };

  const handleAddFriend = async (friendId: string | undefined) => {
    console.log('friendId được truyền vào:', friendId);
    console.log('searchedUsers hiện tại:', searchedUsers);
    
    // Kiểm tra nếu friendId không hợp lệ
    if (!friendId) {
      console.error('friendId không hợp lệ:', friendId);
      dispatch(setError(t('Invalid friend ID')));
      return;
    }
    
    try {
      // Kiểm tra xem friendId có phải là chuỗi "undefined" không
      if (friendId === "undefined") {
        console.error('friendId là chuỗi "undefined"');
        dispatch(setError(t('Invalid friend ID')));
        return;
      }
      
      dispatch(setLoading(true));
      console.log('Gọi API addFriend với friendId:', friendId);
      const newFriend = await FriendService.addFriend(friendId);
      console.log('Kết quả từ API addFriend:', newFriend);
      
      // Tìm thông tin người dùng đã được thêm
      const friendUser = searchedUsers.find(user => 
        user.userId === friendId || (user as any)._id === friendId
      );
      
      if (friendUser && newFriend) {
        // Đảm bảo thông tin người dùng được lưu trong state
        dispatch(setUser(friendUser));
        
        // Thêm yêu cầu kết bạn vào state
        dispatch(addFriend({
          ...newFriend,
          // Đảm bảo các trường cần thiết có giá trị
          _id: newFriend._id || '',
          user_id: newFriend.user_id || userId,
          friend_id: newFriend.friend_id || friendId,
          status: newFriend.status || 'pending'
        }));
        
        // Hiển thị thông báo thành công
        dispatch(setError(null)); // Xóa lỗi nếu có
      }
      
      // Chuyển tab và KHÔNG refresh data
      setActiveTab('sent');
      
      // Làm mới dữ liệu sau khi thêm bạn để hiển thị chính xác
      fetchSentRequests();
    } catch (err) {
      console.error('Lỗi khi thêm bạn:', err);
      dispatch(setError(t('Failed to add friend')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAcceptFriend = async (friendId: string) => {
    try {
      dispatch(setLoading(true));
      const acceptedFriend = await FriendService.acceptFriend(friendId);
      
      if (acceptedFriend && acceptedFriend._id) {
        // Cập nhật state trực tiếp mà không cần refresh toàn bộ dữ liệu
      dispatch(acceptFriend(acceptedFriend));
        
        // Cập nhật localPendingRequests
        setLocalPendingRequests(prev => prev.filter(req => req._id !== acceptedFriend._id));
        
        dispatch(setError(null)); // Xóa lỗi nếu có
      }
      
      setActiveTab('friends');
      
      // Làm mới dữ liệu sau khi chấp nhận bạn để hiển thị chính xác
      fetchData();
      fetchPendingRequests();
    } catch (err) {
      console.error('Lỗi khi chấp nhận lời mời kết bạn:', err);
      dispatch(setError(t('Failed to accept friend')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCancelFriendRequest = async (friendId: string) => {
    try {
      dispatch(setLoading(true));
      const canceledFriend = await FriendService.cancelFriendRequest(friendId);
      
      if (canceledFriend && canceledFriend._id) {
        // Cập nhật state trực tiếp mà không cần refresh toàn bộ dữ liệu
      dispatch(cancelFriendRequest(canceledFriend._id));
        
        // Cập nhật localSentRequests
        setLocalSentRequests(prev => prev.filter(req => req._id !== canceledFriend._id));
        
        dispatch(setError(null)); // Xóa lỗi nếu có
      }
      
      // Làm mới dữ liệu sau khi hủy yêu cầu để hiển thị chính xác
      fetchSentRequests();
    } catch (err) {
      console.error('Lỗi khi hủy yêu cầu kết bạn:', err);
      dispatch(setError(t('Failed to cancel friend request')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      dispatch(setLoading(true));
      const removedFriend = await FriendService.removeFriend(friendId);
      
      if (removedFriend && removedFriend._id) {
        // Cập nhật state trực tiếp mà không cần refresh toàn bộ dữ liệu
      dispatch(removeFriend(removedFriend._id));
        dispatch(setError(null)); // Xóa lỗi nếu có
      }
      
      // Làm mới dữ liệu sau khi xóa bạn để hiển thị chính xác
      fetchData();
    } catch (err) {
      console.error('Lỗi khi xóa bạn bè:', err);
      dispatch(setError(t('Failed to remove friend')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearchUser = async () => {
    try {
      dispatch(setLoading(true));
      const user = await FriendService.searchUserByEmail(searchEmail);
      console.log('Kết quả tìm kiếm người dùng:', user);
      console.log('Cấu trúc đối tượng user:', JSON.stringify(user));
      
      if (user) {
        // Đảm bảo user có thuộc tính userId
        if (!user.userId && user._id) {
          // Nếu không có userId nhưng có _id, sử dụng _id
          user.userId = user._id;
        }
        
        dispatch(setSearchedUsers([user]));
        dispatch(setUser(user));
        dispatch(setError(null)); // Xóa lỗi nếu có
      } else {
        dispatch(setSearchedUsers([]));
        dispatch(setError(t('User not found')));
      }
    } catch (err) {
      console.error('Lỗi khi tìm kiếm người dùng:', err);
      dispatch(setError(t('Failed to search user')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <FriendSidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        currentUser={currentUser}
            />

      {/* Nội dung chính */}
      <div className="flex-1 p-6 overflow-auto">
        <FriendHeader 
          activeTab={activeTab}
          loading={loading}
          onRefresh={forceRefreshAllData}
        />
        
        <ErrorDisplay error={error} loading={loading} />

        {/* All Friends */}
        {activeTab === 'friends' && (
          <AllFriends 
            friends={friends}
            loading={loading}
            onRemoveFriend={handleRemoveFriend}
            renderUserInfo={renderUserInfo}
          />
        )}

        {/* Pending Requests */}
        {activeTab === 'pending' && (
          <PendingRequests 
            pendingRequests={localPendingRequests}
            loading={loading}
            onAcceptFriend={handleAcceptFriend}
            renderUserInfo={renderUserInfo}
          />
        )}

        {/* Sent Requests */}
        {activeTab === 'sent' && (
          <SentRequests 
            sentRequests={localSentRequests}
            loading={loading}
            onCancelRequest={handleCancelFriendRequest}
            renderUserInfo={renderUserInfo}
          />
        )}

        {/* Search Users */}
        {activeTab === 'search' && (
          <SearchUsers 
            searchEmail={searchEmail}
            onSearchEmailChange={setSearchEmail}
            onSearch={handleSearchUser}
            searchedUsers={searchedUsers}
            loading={loading}
            onAddFriend={handleAddFriend}
            onCancelRequest={handleCancelFriendRequest}
            onRemoveFriend={handleRemoveFriend}
            renderUserInfo={renderUserInfo}
            friends={friends}
            sentRequests={localSentRequests}
            pendingRequests={localPendingRequests}
            onAcceptFriend={handleAcceptFriend}
          />
        )}
      </div>
    </div>
  );
};

export default FriendList;