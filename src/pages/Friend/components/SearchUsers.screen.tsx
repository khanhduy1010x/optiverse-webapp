import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { SearchUsersProps } from '../../../types/friend/props/component.props';
import { GROUP_CLASSNAMES } from '../../../styles/group-class-name.style';
import {
  useSearchUser,
} from '../../../hooks/friend/useSearchUser.hook';
import FriendService from '../../../services/friend.service';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

const SearchUsers: React.FC<SearchUsersProps> = props => {
  const { t } = useAppTranslate('friend');
  // Get current user from Redux store
  const { currentUser } = useSelector((state: any) => state.auth);
  const currentUserId = currentUser?._id || localStorage.getItem('user_id');
  
  const {
    username,
    selectedDomain,
    customDomain,
    setCustomDomain,
    showCustomDomain,
    hasSearched,
    customDomainInputRef,
    handleDomainChange,
    handleUsernameChange,
    handleKeyPress,
    handleSearch,
    handleClearSearch,
    checkFriendStatus,
    refreshFriendData,
    EMAIL_DOMAINS
  } = useSearchUser(props);

  const {
    searchedUsers,
    loading,
    renderUserInfo,
    onAddFriend,
    onCancelRequest,
    onRemoveFriend,
    onAcceptRequest = () => {},
    friends,
    sentRequests,
    pendingRequests = [],
    searchEmail,
  } = props;

  // State để lưu trữ trạng thái và thông tin quan hệ của user
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>({});
  const [userRelations, setUserRelations] = useState<Record<string, any>>({});
  const [isProcessingAction, setIsProcessingAction] = useState<
    Record<string, boolean>
  >({});

  // Làm mới trạng thái của users khi có thay đổi
  useEffect(() => {
    const updateUserStatuses = async () => {
      if (!searchedUsers?.length || !currentUserId) return;

      console.log('=== DEBUG: Starting updateUserStatuses ===');
      console.log('searchedUsers:', searchedUsers);
      console.log('currentUserId:', currentUserId);

      try {
        const statuses: Record<string, string> = {};
        const relations: Record<string, any> = {};

        // Xử lý từng người dùng được search
        for (const user of searchedUsers) {
          const userId = user.userId || user._id;
          console.log(`=== Processing user ${userId} ===`);

          // Kiểm tra xem có phải chính mình không
          if (user.is_self || userId === currentUserId) {
            statuses[userId] = 'self';
            console.log(`User ${userId} is self`);
            continue;
          }

          // Set loading state
          statuses[userId] = 'loading';
          console.log(`Set user ${userId} to loading`);

          try {
            // Lấy dữ liệu mối quan hệ từ backend cho user này
            const relationshipData =
              await FriendService.getAllRelationshipsWithUser(userId);

            console.log(`API response for user ${userId}:`, relationshipData);

            if (relationshipData.isFriend && relationshipData.friendRelation) {
              // Là bạn bè - cả hai chiều
              statuses[userId] = 'friend';
              relations[userId] = relationshipData.friendRelation;
              console.log(`User ${userId} is friend`);
            } else if (relationshipData.pendingIncoming) {
              // Người này đã gửi lời mời kết bạn cho mình
              statuses[userId] = 'pending_incoming';
              relations[userId] = relationshipData.pendingIncoming;
              console.log(`User ${userId} has pending incoming request`);
            } else if (relationshipData.sentRequest) {
              // Mình đã gửi lời mời kết bạn cho người này
              statuses[userId] = 'sent';
              relations[userId] = relationshipData.sentRequest;
              console.log(`User ${userId} has sent request`);
            } else {
              // Không có mối quan hệ nào
              statuses[userId] = 'none';
              console.log(`User ${userId} has no relationship`);
            }
          } catch (error) {
            console.error(`Error fetching relationship for user ${userId}:`, error);
            // Nếu có lỗi khi gọi API, thử kiểm tra từ dữ liệu local
            try {
              // Kiểm tra trong danh sách bạn bè
              const isFriend = friends?.some(
                (friend: any) => friend.userId === userId || friend._id === userId
              );
              if (isFriend) {
                statuses[userId] = 'friend';
                console.log(`User ${userId} found in local friends list`);
                continue;
              }

              // Kiểm tra trong danh sách đã gửi request
              const hasSentRequest = sentRequests?.some(
                (request: any) => request.receiverId === userId
              );
              if (hasSentRequest) {
                statuses[userId] = 'sent';
                console.log(`User ${userId} found in local sent requests`);
                continue;
              }

              // Kiểm tra trong danh sách pending requests
              const hasPendingRequest = pendingRequests?.some(
                (request: any) => request.senderId === userId
              );
              if (hasPendingRequest) {
                statuses[userId] = 'pending_incoming';
                console.log(`User ${userId} found in local pending requests`);
                continue;
              }

              // Không có mối quan hệ nào
              statuses[userId] = 'none';
              console.log(`User ${userId} has no relationship (from local data)`);
            } catch (localError) {
              console.error(`Error checking local data for user ${userId}:`, localError);
              statuses[userId] = 'none';
            }
          }
        }

        console.log('=== Final statuses ===:', statuses);
        console.log('=== Final relations ===:', relations);

        setUserStatuses(prev => ({ ...prev, ...statuses }));
        setUserRelations(prev => ({ ...prev, ...relations }));
      } catch (error) {
        console.error('Error updating user statuses:', error);
      }
    };

    updateUserStatuses();
  }, [searchedUsers, currentUserId, friends, sentRequests, pendingRequests]);

  // Hàm wrapper để xử lý friend actions và refresh data
  const handleAddFriendWithRefresh = async (userId: string) => {
    if (isProcessingAction[userId]) return;
    setIsProcessingAction(prev => ({ ...prev, [userId]: true }));

    try {
      // Cập nhật UI trước khi gọi API
      setUserStatuses(prev => ({ ...prev, [userId]: 'sent' }));

      // Tạo một relation tạm thời cho UI
      const tempRelation = {
        _id: `temp_${Date.now()}`,
        friend_id: userId,
        status: 'pending',
      };
      setUserRelations(prev => ({ ...prev, [userId]: tempRelation }));

      // Sau đó gọi API
      await onAddFriend(userId);

      // Clear cache để đảm bảo dữ liệu mới
      FriendService.clearCache();

      // Lấy thông tin mới từ backend
      const relationshipData =
        await FriendService.getAllRelationshipsWithUser(userId);

      // Cập nhật state dựa trên response từ backend
      if (relationshipData.sentRequest) {
        setUserStatuses(prev => ({ ...prev, [userId]: 'sent' }));
        setUserRelations(prev => ({
          ...prev,
          [userId]: relationshipData.sentRequest,
        }));
      } else {
        // Nếu không có sentRequest, có thể đã trở thành bạn ngay lập tức
        if (relationshipData.isFriend && relationshipData.friendRelation) {
          setUserStatuses(prev => ({ ...prev, [userId]: 'friend' }));
          setUserRelations(prev => ({
            ...prev,
            [userId]: relationshipData.friendRelation,
          }));
        }
      }

      // Refresh global data
      refreshFriendData();
    } catch (error) {
      console.error('Error adding friend:', error);
      // Nếu có lỗi, khôi phục lại trạng thái ban đầu (không có quan hệ)
      setUserStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[userId]; // Xóa status để về default case
        return newStatuses;
      });
      setUserRelations(prev => {
        const newRelations = { ...prev };
        delete newRelations[userId];
        return newRelations;
      });
    } finally {
      setIsProcessingAction(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleAcceptFriendWithRefresh = async (requestId: string) => {
    const relation =
      userRelations[
        Object.keys(userRelations).find(
          key => userRelations[key]?._id === requestId
        ) || ''
      ] || pendingRequests.find(r => r._id === requestId);

    if (!relation) {
      console.error('Cannot find pending request with ID:', requestId);
      return;
    }

    const userId = relation.user_id;

    if (isProcessingAction[userId]) return;
    setIsProcessingAction(prev => ({ ...prev, [userId]: true }));

    try {
      // Cập nhật UI trước khi gọi API
      setUserStatuses(prev => ({ ...prev, [userId]: 'friend' }));

      // Tạo một friend relation tạm thời cho UI
      const tempFriendRelation = {
        _id: `temp_${Date.now()}`,
        user_id: relation.user_id,
        friend_id: relation.friend_id,
        status: 'accepted',
      };
      setUserRelations(prev => ({ ...prev, [userId]: tempFriendRelation }));

      // Sau đó gọi API
      console.log('Accepting friend request:', relation);
      await onAcceptRequest(requestId);

      // Clear cache để đảm bảo dữ liệu mới
      FriendService.clearCache();

      // Lấy dữ liệu mới từ backend
      const relationshipData =
        await FriendService.getAllRelationshipsWithUser(userId);

      // Cập nhật UI với dữ liệu mới
      if (relationshipData.isFriend && relationshipData.friendRelation) {
        setUserStatuses(prev => ({ ...prev, [userId]: 'friend' }));
        setUserRelations(prev => ({
          ...prev,
          [userId]: relationshipData.friendRelation,
        }));
      }

      // Refresh global data
      refreshFriendData();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      // Nếu có lỗi, khôi phục lại trạng thái ban đầu
      setUserStatuses(prev => ({ ...prev, [userId]: 'pending_incoming' }));
      setUserRelations(prev => ({ ...prev, [userId]: relation }));
    } finally {
      setIsProcessingAction(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleCancelRequestWithRefresh = async (requestId: string) => {
    const relation =
      userRelations[
        Object.keys(userRelations).find(
          key => userRelations[key]?._id === requestId
        ) || ''
      ] || sentRequests.find(r => r._id === requestId);

    if (!relation) {
      console.error('Cannot find sent request with ID:', requestId);
      return;
    }

    const userId = relation.friend_id;

    if (isProcessingAction[userId]) return;
    setIsProcessingAction(prev => ({ ...prev, [userId]: true }));

    try {
      // Cập nhật UI trước khi gọi API - xóa status để về default case
      setUserStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[userId];
        return newStatuses;
      });
      setUserRelations(prev => {
        const newRelations = { ...prev };
        delete newRelations[userId];
        return newRelations;
      });

      // Sau đó gọi API
      await onCancelRequest(requestId);

      // Clear cache để đảm bảo dữ liệu mới
      FriendService.clearCache();

      // Lấy dữ liệu mới từ backend để đảm bảo cập nhật
      const relationshipData =
        await FriendService.getAllRelationshipsWithUser(userId);

      // Nếu vẫn còn bất kỳ mối quan hệ nào, cập nhật UI tương ứng
      if (relationshipData.isFriend && relationshipData.friendRelation) {
        setUserStatuses(prev => ({ ...prev, [userId]: 'friend' }));
        setUserRelations(prev => ({
          ...prev,
          [userId]: relationshipData.friendRelation,
        }));
      } else if (relationshipData.pendingIncoming) {
        setUserStatuses(prev => ({ ...prev, [userId]: 'pending_incoming' }));
        setUserRelations(prev => ({
          ...prev,
          [userId]: relationshipData.pendingIncoming,
        }));
      } else if (relationshipData.sentRequest) {
        setUserStatuses(prev => ({ ...prev, [userId]: 'sent' }));
        setUserRelations(prev => ({
          ...prev,
          [userId]: relationshipData.sentRequest,
        }));
      }

      // Refresh global data
      refreshFriendData();
    } catch (error) {
      console.error('Error canceling friend request:', error);
      // Nếu có lỗi, khôi phục lại trạng thái ban đầu
      setUserStatuses(prev => ({ ...prev, [userId]: 'sent' }));
      setUserRelations(prev => ({ ...prev, [userId]: relation }));
    } finally {
      setIsProcessingAction(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRemoveFriendWithRefresh = async (friendId: string) => {
    const relation =
      userRelations[
        Object.keys(userRelations).find(
          key => userRelations[key]?._id === friendId
        ) || ''
      ] || friends.find(f => f._id === friendId);

    if (!relation) {
      console.error('Cannot find friend relation with ID:', friendId);
      return;
    }

    const userId =
      relation.user_id === props.userId ? relation.friend_id : relation.user_id;

    if (isProcessingAction[userId]) return;
    setIsProcessingAction(prev => ({ ...prev, [userId]: true }));

    try {
      console.log('Removing friend relation:', relation);

      // Cập nhật UI trước khi gọi API - xóa status để về default case
      setUserStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[userId];
        return newStatuses;
      });
      setUserRelations(prev => {
        const newRelations = { ...prev };
        delete newRelations[userId];
        return newRelations;
      });

      // Sau đó gọi API
      await onRemoveFriend(friendId);

      // Clear cache để đảm bảo dữ liệu mới
      FriendService.clearCache();

      // Lấy dữ liệu mới từ backend để đảm bảo cập nhật
      const relationshipData =
        await FriendService.getAllRelationshipsWithUser(userId);

      // Nếu vẫn còn bất kỳ mối quan hệ nào, cập nhật UI tương ứng
      if (relationshipData.isFriend && relationshipData.friendRelation) {
        setUserStatuses(prev => ({ ...prev, [userId]: 'friend' }));
        setUserRelations(prev => ({
          ...prev,
          [userId]: relationshipData.friendRelation,
        }));
      } else if (relationshipData.pendingIncoming) {
        setUserStatuses(prev => ({ ...prev, [userId]: 'pending_incoming' }));
        setUserRelations(prev => ({
          ...prev,
          [userId]: relationshipData.pendingIncoming,
        }));
      } else if (relationshipData.sentRequest) {
        setUserStatuses(prev => ({ ...prev, [userId]: 'sent' }));
        setUserRelations(prev => ({
          ...prev,
          [userId]: relationshipData.sentRequest,
        }));
      }

      // Refresh global data
      refreshFriendData();
    } catch (error) {
      console.error('Error removing friend:', error);
      // Nếu có lỗi, khôi phục lại trạng thái ban đầu
      setUserStatuses(prev => ({ ...prev, [userId]: 'friend' }));
      setUserRelations(prev => ({ ...prev, [userId]: relation }));
    } finally {
      setIsProcessingAction(prev => ({ ...prev, [userId]: false }));
    }
  };

  const renderActionButton = (userId: string) => {
    // Kiểm tra xem có đang xử lý hành động nào không
    if (isProcessingAction[userId]) {
      return (
        <button
          className="px-4 py-2 bg-gray-300 text-white rounded-lg cursor-wait"
          disabled
        >
          <div className="w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        </button>
      );
    }

    // Sử dụng trạng thái đã lưu trong state
    const status = userStatuses[userId] || 'none';

    // Nếu đang loading, hiển thị nút loading
    if (status === 'loading') {
      return (
        <button
          className="px-4 py-2 bg-gray-300 text-white rounded-lg cursor-wait"
          disabled
        >
          <div className="w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        </button>
      );
    }

    // Lấy thông tin quan hệ từ state đã lưu
    const relation = userRelations[userId];
    console.log(
      `Rendering button for user ${userId} with status: ${status}, relation:`,
      relation
    );

    switch (status) {
      case 'self':
        return null;

      case 'friend':
        // Nếu không tìm thấy relation nhưng status là friend, hiển thị nút Add Friend thay vì loading
        if (!relation) {
          console.warn(
            `Friend relation not found for user ${userId} but status is 'friend'. Showing Add Friend button.`
          );
          return (
            <button
              onClick={() => handleAddFriendWithRefresh(userId)}
              className="px-4 py-2 bg-[#21b4ca] text-white rounded-lg hover:bg-[#1c9eb1] transition-colors duration-300 flex items-center gap-2"
              disabled={isProcessingAction[userId]}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t('add_friend')}
            </button>
          );
        }

        return (
          <button
            onClick={() => handleRemoveFriendWithRefresh(relation._id)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center gap-1"
            disabled={isProcessingAction[userId]}
          >
            {t('remove_friend')}
          </button>
        );

      case 'pending_incoming':
        if (!relation) {
          console.warn(
            `Pending relation not found for user ${userId} but status is 'pending_incoming'. Showing Add Friend button.`
          );
          return (
            <button
              onClick={() => handleAddFriendWithRefresh(userId)}
              className="px-4 py-2 bg-[#21b4ca] text-white rounded-lg hover:bg-[#1c9eb1] transition-colors duration-300 flex items-center gap-2"
              disabled={isProcessingAction[userId]}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t('add_friend')}
            </button>
          );
        }

        return (
          <button
            onClick={() => handleAcceptFriendWithRefresh(relation._id)}
            className="px-4 py-2 bg-[#21b4ca] text-white rounded-lg hover:bg-[#1c9eb1] transition-colors duration-300 flex items-center gap-2 cursor-pointer"
            disabled={isProcessingAction[userId]}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {t('accept_request')}
          </button>
        );

      case 'sent':
        if (!relation) {
          console.warn(
            `Sent relation not found for user ${userId} but status is 'sent'. Showing Add Friend button.`
          );
          return (
            <button
              onClick={() => handleAddFriendWithRefresh(userId)}
              className="px-4 py-2 bg-[#21b4ca] text-white rounded-lg hover:bg-[#1c9eb1] transition-colors duration-300 flex items-center gap-2"
              disabled={isProcessingAction[userId]}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t('add_friend')}
            </button>
          );
        }

        return (
          <button
            onClick={() => handleCancelRequestWithRefresh(relation._id)}
            className="px-4 py-2 bg-[#607D8B] text-white rounded-lg hover:bg-red-500 transition-colors duration-300 flex items-center gap-2 cursor-pointer"
            disabled={isProcessingAction[userId]}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {t('cancel_request')}
          </button>
        );

      case 'none':
      default:
        return (
          <button
            onClick={() => handleAddFriendWithRefresh(userId)}
            className="px-4 py-2 bg-[#21b4ca] cursor-pointer text-white rounded-lg hover:bg-[#1c9eb1] transition-colors duration-300 flex items-center gap-2"
            disabled={isProcessingAction[userId]}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t('add_friend')}
          </button>
        );
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t('search_for_friends')}
        </h3>

        {/* Inputs and buttons in one row */}
        <div className="flex items-center gap-4">
          {/* Username input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t('enter_username')}
              value={username}
              onChange={handleUsernameChange}
              onKeyPress={handleKeyPress}
              className="pl-10 p-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              disabled={loading}
            />
          </div>

          {/* Email domain select */}
          <div className="w-1/3">
            {!showCustomDomain ? (
              <select
                value={selectedDomain}
                onChange={handleDomainChange}
                className="p-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                disabled={loading}
              >
                {EMAIL_DOMAINS.map(domain => (
                  <option key={domain.value} value={domain.value}>
                    {domain.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex">
                <select
                  value={selectedDomain}
                  onChange={handleDomainChange}
                  className="p-3 w-1/2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  disabled={loading}
                >
                  {EMAIL_DOMAINS.map(domain => (
                    <option key={domain.value} value={domain.value}>
                      {domain.label}
                    </option>
                  ))}
                </select>
                <input
                  ref={customDomainInputRef}
                  type="text"
                  placeholder={t('example_domain')}
                  value={customDomain}
                  onChange={e => setCustomDomain(e.target.value)}
                  className="p-3 w-1/2 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Buttons on the right */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-[#21b4ca] cursor-pointer text-white rounded-lg hover:bg-[#1c9eb1] transition-colors duration-300 flex items-center justify-center"
              disabled={
                loading ||
                username === '' ||
                (showCustomDomain && customDomain === '@')
              }
              title={t('search')}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {(hasSearched || searchEmail) && (
              <button
                onClick={handleClearSearch}
                className="px-3 py-2 bg-[#607D8B] cursor-pointer text-white rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center justify-center"
                disabled={loading}
                title={t('clear')}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500 mb-4">
        {t('search_description')}
      </p>

      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && searchedUsers.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {t('search_results')}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchedUsers.map(user => {
              const actualUserId = user.userId || (user as any)._id;
              const status = userStatuses[actualUserId] || 'loading';
              return (
                <div
                  key={actualUserId}
                  className="bg-white rounded-lg p-5 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || user.email || t('user')}
                          className="w-14 h-14 rounded-full object-cover mr-4"
                          onError={e => {
                            e.currentTarget.onerror = null;
                            const initial = user.email
                              ? user.email.charAt(0).toUpperCase()
                              : 'U';
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xl font-medium mr-4">
                          {user.email
                            ? user.email.charAt(0).toUpperCase()
                            : 'U'}
                        </div>
                      )}
                      <div>{renderUserInfo(actualUserId, true)}</div>
                    </div>
                    <div>{renderActionButton(actualUserId)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        !loading &&
        hasSearched && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t('no_results_found')}
            </h3>
            <p className="text-gray-500">{t('no_results_description')}</p>
          </div>
        )
      )}
    </div>
  );
};

export default SearchUsers;
