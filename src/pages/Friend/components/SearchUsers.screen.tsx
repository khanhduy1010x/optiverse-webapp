import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchUsersProps } from '../../../types/friend/props/component.props';
import { GROUP_CLASSNAMES } from '../../../styles/group-class-name.style';


const EMAIL_DOMAINS = [
  { value: '@gmail.com', label: '@gmail.com' },
  { value: '@fpt.edu.vn', label: '@fpt.edu.vn' },
  { value: 'custom', label: 'Other' }
];

const SearchUsers: React.FC<SearchUsersProps> = ({
  searchEmail,
  onSearchEmailChange,
  onSearch,
  searchedUsers,
  loading,
  onAddFriend,
  onCancelRequest,
  onRemoveFriend,
  renderUserInfo,
  friends,
  sentRequests,
  pendingRequests = [],
  onAcceptFriend = () => { }
}) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(EMAIL_DOMAINS[0].value);
  const [customDomain, setCustomDomain] = useState('@');
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const customDomainInputRef = useRef<HTMLInputElement>(null);

  // Reset search state when searchEmail is cleared externally
  useEffect(() => {
    if (!searchEmail) {
      setHasSearched(false);
    }
  }, [searchEmail]);

  // Update searchEmail when username or domain changes
  useEffect(() => {
    if (showCustomDomain) {
      onSearchEmailChange(username + customDomain);
    } else {
      onSearchEmailChange(username + selectedDomain);
    }
  }, [username, selectedDomain, customDomain, showCustomDomain, onSearchEmailChange]);

  // Handle domain selection change
  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDomain(value);
    setShowCustomDomain(value === 'custom');

    // Focus on custom domain input when "Other" is selected
    if (value === 'custom' && customDomainInputRef.current) {
      setTimeout(() => {
        customDomainInputRef.current?.focus();
      }, 0);
    }
  };

  // Handle username input change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // If user enters @ symbol, handle it specially
    if (value.includes('@')) {
      // Split at the @ symbol
      const parts = value.split('@');
      const usernamePart = parts[0];
      setUsername(usernamePart);

      // If there's text after @, set it as custom domain
      if (parts[1]) {
        setSelectedDomain('custom');
        setCustomDomain('@' + parts[1]);
        setShowCustomDomain(true);
      } else {
        // If just @ was typed, focus on the domain input
        setSelectedDomain('custom');
        setShowCustomDomain(true);
        setCustomDomain('@');

        // Focus on custom domain input
        setTimeout(() => {
          customDomainInputRef.current?.focus();
        }, 0);
      }
    } else {
      setUsername(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    setHasSearched(true);
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

  // Hàm kiểm tra trạng thái kết bạn
  const checkFriendStatus = (userId: string) => {
    // Kiểm tra xem có phải là chính mình không
    // if (userId === localStorage.getItem('userId')) {
    //   return 'self';
    // }

    // Kiểm tra xem user có thuộc tính is_self = true không
    const userWithIsSelf = searchedUsers.find(u => {
      const id = u.userId || (u as any)._id;
      return id === userId && u.is_self === true;
    });

    if (userWithIsSelf) {
      return 'self';
    }

    // Kiểm tra xem đã là bạn bè chưa
    const isFriend = friends.some(friend => friend.friend_id === userId);
    if (isFriend) {
      return 'friend';
    }

    // Kiểm tra xem người dùng có gửi lời mời kết bạn đến mình không
    const isPendingIncoming = pendingRequests.some(request => request.user_id === userId);
    if (isPendingIncoming) {
      return 'pending_incoming';
    }

    // Kiểm tra xem đã gửi lời mời kết bạn chưa
    const sentRequest = sentRequests.find(request => request.friend_id === userId);
    if (sentRequest) {
      return 'sent';
    }

    // Chưa có mối quan hệ nào
    return 'none';
  };

  // Render nút tương tác dựa trên trạng thái kết bạn
  const renderActionButton = (userId: string) => {
    const status = checkFriendStatus(userId);
    const sentRequest = sentRequests.find(request => request.friend_id === userId);
    // Tìm yêu cầu kết bạn đã nhận từ người dùng này nếu có
    const pendingIncomingRequest = pendingRequests.find(request => request.user_id === userId);
    // Tìm mối quan hệ bạn bè nếu đã là bạn
    const friendRelation = friends.find(friend => friend.friend_id === userId);

    switch (status) {
      case 'self':
        return null; // Không hiển thị nút nào khi tìm kiếm chính mình
      case 'friend':
        return (
          <button
            onClick={() => friendRelation && onRemoveFriend(friendRelation._id)}
            className={GROUP_CLASSNAMES.buttonRemove}
            disabled={loading || !friendRelation}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('Remove Friend')}
          </button>
        );
      case 'pending_incoming':
        return (
          <button
            onClick={() => pendingIncomingRequest && onAcceptFriend(pendingIncomingRequest._id)}
            className={GROUP_CLASSNAMES.buttonAccept}
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('Accept Request')}
          </button>
        );
      case 'sent':
        return (
          <button
            onClick={() => onCancelRequest(sentRequest._id)}
            className={GROUP_CLASSNAMES.buttonCancel}
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('Cancel Request')}
          </button>
        );
      default:
        return (
          <button
            onClick={() => onAddFriend(userId)}
            className={GROUP_CLASSNAMES.buttonAdd}
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {t('Add Friend')}
          </button>
        );
    }
  };

  return (
    <div>
      <div className={GROUP_CLASSNAMES.friendSearchContainer}>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('Search for Friends')}</h3>
        <div className={GROUP_CLASSNAMES.friendSearchInput}>
          <div className={GROUP_CLASSNAMES.friendSearchInputInner}>
            <div className={GROUP_CLASSNAMES.friendSearchInputIcon}>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t('Enter username')}
              value={username}
              onChange={handleUsernameChange}
              onKeyPress={handleKeyPress}
              className={GROUP_CLASSNAMES.friendSearchInputField}
              disabled={loading}
            />
          </div>
        </div>
        <div className={GROUP_CLASSNAMES.friendSearchInput}>
          {!showCustomDomain ? (
            <select
              value={selectedDomain}
              onChange={handleDomainChange}
              className={GROUP_CLASSNAMES.friendSearchInputField}
              disabled={loading}
            >
              {EMAIL_DOMAINS.map(domain => (
                <option key={domain.value} value={domain.value}>
                  {domain.label}
                </option>
              ))}
            </select>
          ) : (
            <>
              <select
                value={selectedDomain}
                onChange={handleDomainChange}
                className={GROUP_CLASSNAMES.friendSearchInputField}
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
                placeholder={t('@example.com')}
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className={GROUP_CLASSNAMES.friendSearchInputField}
                disabled={loading}
              />
            </>
          )}
        </div>
        <button
          onClick={handleSearch}
          className={GROUP_CLASSNAMES.buttonSearch}
          disabled={loading || (username === '') || (showCustomDomain && customDomain === '@')}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          {t('Search')}
        </button>
        {(hasSearched || searchEmail) && (
          <button
            onClick={handleClearSearch}
            className={GROUP_CLASSNAMES.buttonCancel}
            disabled={loading}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('Clear')}
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {t('Enter a username and select an email domain to find users. You can then send them friend requests.')}
      </p>

      {loading && (
        <div className={GROUP_CLASSNAMES.friendLoadingContainer}>
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && searchedUsers.length > 0 ? (
        <div className={GROUP_CLASSNAMES.friendSearchResultsContainer}>
          <div className={GROUP_CLASSNAMES.friendSearchResultsHeader}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t('Search Results')}</h3>
          </div>
          <div className={GROUP_CLASSNAMES.friendSearchResultsGrid}>
            {searchedUsers.map((user) => {
              const actualUserId = user.userId || (user as any)._id;
              const status = checkFriendStatus(actualUserId);
              return (
                <div
                  key={actualUserId}
                  className={GROUP_CLASSNAMES.friendSearchResultCard}
                >
                  <div className={GROUP_CLASSNAMES.friendSearchResultCardInner}>
                    <div className={GROUP_CLASSNAMES.friendSearchResultCardAvatar}>
                      <div className={GROUP_CLASSNAMES.avatarSmall}>
                        {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div className={GROUP_CLASSNAMES.friendSearchResultCardInfo}>
                      <div className={GROUP_CLASSNAMES.friendSearchResultCardName}>
                        {renderUserInfo(actualUserId, true)}
                      </div>
                      {status === 'self' && (
                        <div className={GROUP_CLASSNAMES.friendSearchResultCardSelf}>
                          {t('This is you')}
                        </div>
                      )}
                      {status === 'pending_incoming' && (
                        <div className={GROUP_CLASSNAMES.friendSearchResultCardPending}>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('Has sent you a friend request')}
                        </div>
                      )}
                      {status === 'sent' && (
                        <div className={GROUP_CLASSNAMES.friendSearchResultCardSent}>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          {t('Request sent')}
                        </div>
                      )}
                      {status === 'friend' && (
                        <div className={GROUP_CLASSNAMES.friendSearchResultCardFriend}>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t('Already friends')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={GROUP_CLASSNAMES.friendSearchResultCardActions}>
                    {renderActionButton(actualUserId)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        !loading && hasSearched && (
          <div className={GROUP_CLASSNAMES.friendNoResultsContainer}>
            <div className={GROUP_CLASSNAMES.friendNoResultsIcon}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{t('No users found')}</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {searchEmail
                ? t('No users found with the email address "{email}". Try a different email.', { email: searchEmail })
                : t('Enter a username and select an email domain to search for users.')}
            </p>
            <button
              onClick={handleClearSearch}
              className={GROUP_CLASSNAMES.friendNoResultsButton}
            >
              {t('Clear search')}
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default SearchUsers; 