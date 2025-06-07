import React from 'react';
import { SearchUsersProps } from '../../../types/friend/props/component.props';
import { GROUP_CLASSNAMES } from '../../../styles/group-class-name.style';
import {
  EMAIL_DOMAINS,
  useSearchUser,
} from '../../../hooks/friend/useSearchUser.hook';

const SearchUsers: React.FC<SearchUsersProps> = props => {
  const {
    t,
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
  } = useSearchUser(props);

  const {
    searchedUsers,
    loading,
    renderUserInfo,
    onAddFriend,
    onCancelRequest,
    onRemoveFriend,
    onAcceptFriend = () => {},
    friends,
    sentRequests,
    pendingRequests,
    searchEmail,
  } = props;

  const renderActionButton = (userId: string) => {
    const status = checkFriendStatus(userId);
    const sentRequest = sentRequests.find(r => r.friend_id === userId);
    const pendingIncomingRequest = pendingRequests.find(
      r => r.user_id === userId
    );
    const friendRelation = friends.find(f => f.friend_id === userId);

    switch (status) {
      case 'self':
        return null;
      case 'friend':
        return (
          <button
            onClick={() => friendRelation && onRemoveFriend(friendRelation._id)}
            className={GROUP_CLASSNAMES.buttonRemove}
            disabled={loading}
          >
            {t('Remove Friend')}
          </button>
        );
      case 'pending_incoming':
        return (
          <button
            onClick={() =>
              pendingIncomingRequest &&
              onAcceptFriend(pendingIncomingRequest._id)
            }
            className={GROUP_CLASSNAMES.buttonAccept}
            disabled={loading}
          >
            {t('Accept Request')}
          </button>
        );
      case 'sent':
        return (
          <button
            onClick={() => sentRequest && onCancelRequest(sentRequest._id)}
            className={GROUP_CLASSNAMES.buttonCancel}
            disabled={loading}
          >
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
            {t('Add Friend')}
          </button>
        );
    }
  };

  return (
    <div>
      <div className={GROUP_CLASSNAMES.friendSearchContainer}>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {t('Search for Friends')}
        </h3>
        <div className={GROUP_CLASSNAMES.friendSearchInput}>
          <div className={GROUP_CLASSNAMES.friendSearchInputInner}>
            <div className={GROUP_CLASSNAMES.friendSearchInputIcon}>
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
                onChange={e => setCustomDomain(e.target.value)}
                className={GROUP_CLASSNAMES.friendSearchInputField}
                disabled={loading}
              />
            </>
          )}
        </div>
        <button
          onClick={handleSearch}
          className={GROUP_CLASSNAMES.buttonSearch}
          disabled={
            loading ||
            username === '' ||
            (showCustomDomain && customDomain === '@')
          }
        >
          {t('Search')}
        </button>
        {(hasSearched || searchEmail) && (
          <button
            onClick={handleClearSearch}
            className={GROUP_CLASSNAMES.buttonCancel}
            disabled={loading}
          >
            {t('Clear')}
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {t(
          'Enter a username and select an email domain to find users. You can then send them friend requests.'
        )}
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {t('Search Results')}
            </h3>
          </div>
          <div className={GROUP_CLASSNAMES.friendSearchResultsGrid}>
            {searchedUsers.map(user => {
              const actualUserId = user.userId || (user as any)._id;
              const status = checkFriendStatus(actualUserId);
              return (
                <div
                  key={actualUserId}
                  className={GROUP_CLASSNAMES.friendSearchResultCard}
                >
                  <div className={GROUP_CLASSNAMES.friendSearchResultCardInner}>
                    <div
                      className={GROUP_CLASSNAMES.friendSearchResultCardAvatar}
                    >
                      <div className={GROUP_CLASSNAMES.avatarSmall}>
                        {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div
                      className={GROUP_CLASSNAMES.friendSearchResultCardInfo}
                    >
                      <div
                        className={GROUP_CLASSNAMES.friendSearchResultCardName}
                      >
                        {renderUserInfo(actualUserId, true)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={GROUP_CLASSNAMES.friendSearchResultCardActions}
                  >
                    {renderActionButton(actualUserId)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        !loading &&
        hasSearched && (
          <div className={GROUP_CLASSNAMES.friendNoResultsContainer}>
            <div className={GROUP_CLASSNAMES.friendNoResultsIcon}>
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {t('No users found')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {searchEmail
                ? t(
                    'No users found with the email address "{email}". Try a different email.',
                    { email: searchEmail }
                  )
                : t(
                    'Enter a username and select an email domain to search for users.'
                  )}
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
