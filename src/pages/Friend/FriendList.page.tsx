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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'pending' && pendingRequests.length === 0) {
      fetchPendingRequests();
    } else if (tab === 'sent' && sentRequests.length === 0) {
      fetchSentRequests();
    }
  };

  return (
    <div className="flex h-screen bg-white">
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
