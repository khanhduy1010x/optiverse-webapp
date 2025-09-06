import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { toast } from 'react-toastify';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const FriendList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAppTranslate('friend');

  const {
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
        {showId && (
          <span className="text-xs text-gray-400">
            {t('id_label', { id: userId })}
          </span>
        )}
      </span>
    );
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'pending') {
      fetchPendingRequests();
    } else if (tab === 'sent') {
      fetchSentRequests();
    } else if (tab === 'friends') {
      fetchData();
    }
  };

  const handleStartChat = (friendId: string) => {
    navigate('/chat', { state: { friendId } });
  };

  const handleRefresh = async () => {
    try {
      const result = await forceRefreshAllData();

      if (result.tab === 'friends') {
        if (result.hasChanges) {
          toast.success(t('friend_list_updated', { count: result.count }));
        } else {
          toast.info(t('friend_list_up_to_date'));
        }
      } else if (result.tab === 'pending') {
        if (result.hasChanges) {
          toast.success(t('pending_requests_updated', { count: result.count }));
        } else {
          toast.info(t('pending_requests_up_to_date'));
        }
      } else if (result.tab === 'sent') {
        if (result.hasChanges) {
          toast.success(t('sent_requests_updated', { count: result.count }));
        } else {
          toast.info(t('sent_requests_up_to_date'));
        }
      } else if (result.tab === 'search') {
        if (result.hasChanges) {
          toast.success(t('search_results_updated'));
        } else {
          toast.info(t('search_results_up_to_date'));
        }
      }
    } catch (e) {
      toast.error(t('failed_to_refresh'));
      console.error('Refresh error:', e);
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
          onRefresh={handleRefresh}
        />

        <ErrorDisplay error={error} loading={loading} />

        {/* All Friends */}
        {activeTab === 'friends' && (
          <AllFriends
            friends={friends}
            loading={loading}
            onRemoveFriend={handleRemoveFriend}
            renderUserInfo={renderUserInfo}
            onRefresh={handleRefresh}
            onStartChat={handleStartChat}
          />
        )}

        {/* Pending Requests */}
        {activeTab === 'pending' && (
          <PendingRequests
            pendingRequests={pendingRequests}
            loading={loading}
            onAcceptFriend={handleAcceptFriend}
            renderUserInfo={renderUserInfo}
          />
        )}

        {/* Sent Requests */}
        {activeTab === 'sent' && (
          <SentRequests
            sentRequests={sentRequests}
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
            sentRequests={sentRequests}
            pendingRequests={pendingRequests}
            onAcceptRequest={handleAcceptFriend}
            userId={userId}
            refreshFriendData={forceRefreshAllData}
          />
        )}
      </div>
    </div>
  );
};

export default FriendList;
