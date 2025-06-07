import React from 'react';
import FriendService from '../../services/friend.service';
import {
  setFriends,
  setSearchedUsers,
  setError,
  setLoading,
} from '../../store/slices/friend.slice';
import {
  FriendSidebar,
  FriendHeader,
  AllFriends,
  PendingRequests,
  SentRequests,
  SearchUsers,
  ErrorDisplay,
} from './components';
import { useFriendList } from '../../hooks/friend/useFriendList.hook';

const FriendList: React.FC = () => {
  const {
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
    forceRefreshAllData,
  } = useFriendList();

  // Render user info with name if available
  const renderUserInfo = (userId: string, showId: boolean = false) => {
    const user = users[userId];

    if (!user) return userId;

    return (
      <span className="flex flex-col">
        {(user as any).full_name ? (
          <>
            <span className="font-medium text-base">
              {(user as any).full_name}
            </span>
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
