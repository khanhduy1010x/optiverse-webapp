import { useEffect, useRef, useState, useCallback } from 'react';
import { SearchUsersProps } from '../../types/friend/props/component.props';
import FriendService from '../../services/friend.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export const useSearchUser = (props: SearchUsersProps) => {
  const {
    searchEmail,
    onSearchEmailChange,
    onSearch,
    searchedUsers,
    friends,
    sentRequests,
    pendingRequests,
  } = props;
  const { t } = useAppTranslate('friend');

  const EMAIL_DOMAINS = [
    { value: '@gmail.com', label: '@gmail.com' },
    { value: '@fpt.edu.vn', label: '@fpt.edu.vn' },
    { value: 'custom', label: t('other') },
  ];

  const [username, setUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(EMAIL_DOMAINS[0].value);
  const [customDomain, setCustomDomain] = useState('@');
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [friendStatusCache, setFriendStatusCache] = useState<
    Record<string, string>
  >({});
  const customDomainInputRef = useRef<HTMLInputElement>(null);

  // Fetch friend data
  const refreshFriendData = useCallback(async () => {
    try {
      // Khi gọi refreshFriendData, làm mới toàn bộ dữ liệu
      FriendService.clearCache();
      const [friendsList, sentList, pendingList] = await Promise.all([
        FriendService.viewAllFriends(),
        FriendService.viewAllSent(),
        FriendService.viewAllPending(),
      ]);



      // Trigger lại hàm kiểm tra trạng thái với key mới
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to refresh friend data:', error);
    }
  }, []);

  useEffect(() => {
    if (!searchEmail) setHasSearched(false);
  }, [searchEmail]);

  useEffect(() => {
    const cleanUsername = username.trim();
    const email = showCustomDomain
      ? cleanUsername + customDomain
      : cleanUsername + selectedDomain;
    onSearchEmailChange(email);
  }, [
    username,
    selectedDomain,
    customDomain,
    showCustomDomain,
    onSearchEmailChange,
  ]);

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDomain(value);
    setShowCustomDomain(value === 'custom');
    if (value === 'custom') {
      setTimeout(() => customDomainInputRef.current?.focus(), 0);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes('@')) {
      const parts = value.split('@');
      setUsername(parts[0].trim());
      setSelectedDomain('custom');
      setCustomDomain(parts[1] ? '@' + parts[1].trim() : '@');
      setShowCustomDomain(true);
      setTimeout(() => customDomainInputRef.current?.focus(), 0);
    } else {
      setUsername(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Làm sạch dữ liệu trước khi tìm kiếm
      const cleanedUsername = username.trim();
      setUsername(cleanedUsername);

      handleSearch();
    }
  };

  const handleSearch = () => {
    setHasSearched(true);

    // Tạo email được làm sạch để cập nhật lại
    const cleanedUsername = username.trim();
    setUsername(cleanedUsername);

    // Đảm bảo email đã được làm sạch đúng cách
    const email = showCustomDomain
      ? cleanedUsername + customDomain
      : cleanedUsername + selectedDomain;
    onSearchEmailChange(email);

    // Thực hiện tìm kiếm
    onSearch();
  };

  const handleClearSearch = () => {
    setUsername('');
    setSelectedDomain(EMAIL_DOMAINS[0].value);
    setCustomDomain('@');
    setShowCustomDomain(false);
    setHasSearched(false);
    onSearchEmailChange('');
  };

  // Kiểm tra trạng thái bạn bè với data mới nhất từ backend
  const checkFriendStatus = useCallback(
    async (userId: string) => {
      // Trước tiên, kiểm tra cache
      const cachedStatus = friendStatusCache[userId];

      // Nếu có trong cache và chưa quá cũ, trả về kết quả từ cache
      if (cachedStatus) {
        return cachedStatus;
      }

      // Kiểm tra xem có phải là chính mình không
      const isSelf = searchedUsers.find(
        u => (u.userId || (u as any)._id) === userId && u.is_self
      );

      if (isSelf) {
        setFriendStatusCache(prev => ({ ...prev, [userId]: 'self' }));
        return 'self';
      }

      try {
        // Lấy dữ liệu bạn bè mới nhất từ backend
        const allFriends = await FriendService.viewAllFriends();
        const allSentRequests = await FriendService.viewAllSent();
        const allPendingRequests = await FriendService.viewAllPending();

        // Kiểm tra trạng thái bạn bè - cả hai chiều
        if (
          allFriends.some(f => f.friend_id === userId || f.user_id === userId)
        ) {
          setFriendStatusCache(prev => ({ ...prev, [userId]: 'friend' }));
          return 'friend';
        }

        // Kiểm tra trạng thái pending request - cả hai chiều
        if (
          allPendingRequests &&
          allPendingRequests.some(r => r.user_id === userId)
        ) {
          setFriendStatusCache(prev => ({
            ...prev,
            [userId]: 'pending_incoming',
          }));
          return 'pending_incoming';
        }

        // Kiểm tra nếu có lời mời từ người này gửi đến cho mình
        if (
          allSentRequests &&
          allSentRequests.some(r => r.user_id === userId)
        ) {
          setFriendStatusCache(prev => ({
            ...prev,
            [userId]: 'pending_incoming',
          }));
          return 'pending_incoming';
        }

        // Kiểm tra trạng thái sent request
        if (allSentRequests.some(r => r.friend_id === userId)) {
          setFriendStatusCache(prev => ({ ...prev, [userId]: 'sent' }));
          return 'sent';
        }

        // Nếu không thuộc trường hợp nào
        setFriendStatusCache(prev => ({ ...prev, [userId]: 'none' }));
        return 'none';
      } catch (error) {
        console.error('Error checking friend status:', error);

        // Fallback về state local nếu có lỗi
        if (friends.some(f => f.friend_id === userId || f.user_id === userId)) {
          return 'friend';
        }
        if (
          pendingRequests &&
          pendingRequests.some(r => r.user_id === userId)
        ) {
          return 'pending_incoming';
        }
        if (sentRequests.some(r => r.friend_id === userId)) {
          return 'sent';
        }
        return 'none';
      }
    },
    [
      friends,
      pendingRequests,
      sentRequests,
      searchedUsers,
      friendStatusCache,
      refreshKey,
    ]
  );

  // Xóa cache khi refreshKey thay đổi
  useEffect(() => {
    setFriendStatusCache({});
  }, [refreshKey]);

  return {
    t,
    EMAIL_DOMAINS,
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
  };
};
