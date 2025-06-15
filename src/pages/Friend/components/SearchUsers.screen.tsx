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
    onAcceptFriend = () => { },
    friends,
    sentRequests,
    pendingRequests = [],
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
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center gap-1"
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
            className="px-4 py-2 bg-[#21b4ca] text-white rounded-lg hover:bg-[#1c9eb1] transition-colors duration-300 flex items-center gap-2 cursor-pointer"
            disabled={loading}
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
            {t('Accept Request')}
          </button>
        );
      case 'sent':
        return (
          <button
            onClick={() => sentRequest && onCancelRequest(sentRequest._id)}
            className="px-4 py-2 bg-[#607D8B] text-white rounded-lg hover:bg-red-500 transition-colors duration-300 flex items-center gap-2 cursor-pointer"
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
            className="px-4 py-2 bg-[#21b4ca] cursor-pointer text-white rounded-lg hover:bg-[#1c9eb1] transition-colors duration-300 flex items-center gap-2"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('Add Friend')}
          </button>
        );
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t('Search for Friends')}
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
              placeholder={t('Enter username')}
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
                  placeholder={t('@example.com')}
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
              title={t('Search')}
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
                title={t('Clear')}
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
        {t(
          'Enter a username and select an email domain to find users. You can then send them friend requests.'
        )}
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
              {t('Search Results')}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchedUsers.map(user => {
              const actualUserId = user.userId || (user as any)._id;
              const status = checkFriendStatus(actualUserId);
              return (
                <div
                  key={actualUserId}
                  className="bg-white rounded-lg p-5 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xl font-medium mr-4">
                        {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        {renderUserInfo(actualUserId, true)}
                      </div>
                    </div>
                    <div>
                      {renderActionButton(actualUserId)}
                    </div>
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
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('No users found')}
            </h3>
            <p className="text-gray-500 mb-6">
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
              className="px-4 py-2 bg-[#607D8B] text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
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
