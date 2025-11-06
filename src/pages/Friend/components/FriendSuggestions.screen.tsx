import React, { useState } from 'react';
import { Friend } from '../../../types/friend/friend.response';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

interface FriendSuggestionsProps {
  suggestions: Friend[];
  loading: boolean;
  onAddFriend: (friendId: string) => void;
  onRefresh: () => void;
}

const FriendSuggestions: React.FC<FriendSuggestionsProps> = ({
  suggestions,
  loading,
  onAddFriend,
  onRefresh,
}) => {
  const { t } = useAppTranslate('friend');
  const [addingFriend, setAddingFriend] = useState<string | null>(null);

  const handleAddFriend = async (friendId: string) => {
    if (addingFriend) return; // Prevent multiple clicks
    
    setAddingFriend(friendId);
    try {
      await onAddFriend(friendId);
    } finally {
      // Reset loading state after a short delay to prevent flashing
      setTimeout(() => setAddingFriend(null), 500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-white rounded-lg p-5 shadow-sm border border-gray-200"
          >
            <div className="flex items-center space-x-4 animate-pulse">
              <div className="rounded-full bg-gray-200 h-16 w-16"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {t('no_friend_suggestions')}
        </h3>
        <p className="text-gray-500 mb-6">
          {t('no_friend_suggestions_description')}
        </p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('refresh_suggestions')}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {suggestions.map(suggestion => {
        const initial =
          suggestion.friendInfo?.full_name?.[0]?.toUpperCase() ||
          suggestion.friendInfo?.email?.[0]?.toUpperCase() ||
          suggestion.friend_id[0]?.toUpperCase();

        return (
          <div
            key={suggestion._id}
            className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center flex-1">
                {suggestion.friendInfo?.avatar_url ? (
                  <img
                    src={suggestion.friendInfo.avatar_url}
                    alt={suggestion.friendInfo.full_name || t('friend_suggestion')}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-2xl font-medium mr-4">
                    {initial}
                  </div>
                )}
                <div className="flex-1">
                  {suggestion.friendInfo && (
                    <div className="flex flex-col">
                      {suggestion.friendInfo.full_name && (
                        <span className="font-semibold text-lg text-gray-800">
                          {suggestion.friendInfo.full_name}
                        </span>
                      )}
                      {suggestion.friendInfo.email && (
                        <span className="text-sm text-gray-500 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {suggestion.friendInfo.email}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAddFriend(suggestion.friend_id)}
                      disabled={addingFriend === suggestion.friend_id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        addingFriend === suggestion.friend_id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {addingFriend === suggestion.friend_id ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t('sending')}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          {t('add_as_friend')}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FriendSuggestions;