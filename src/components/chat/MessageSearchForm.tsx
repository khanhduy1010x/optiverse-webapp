import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { MessageSearchFormProps } from '../../types/chat/props/component.props';

const MessageSearchForm: React.FC<MessageSearchFormProps> = ({
  showMessageSearch,
  messageSearchQuery,
  setMessageSearchQuery,
  handleMessageSearchSubmit,
  clearSearch,
  searchLoading,
  searchError,
  searchResults,
  messageRefs,
  setHighlightedMessageId,
}) => {
  const { t } = useAppTranslate('chat');

  if (!showMessageSearch) return null;

  return (
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] shadow-sm">
      <form onSubmit={handleMessageSearchSubmit} className="flex gap-3 mb-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={messageSearchQuery}
            onChange={e => setMessageSearchQuery(e.target.value)}
            placeholder={t('search_messages_placeholder')}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 placeholder-gray-500 bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#21b4ca] focus:border-transparent hover:border-gray-400 leading-relaxed"
          />
          {/* Search icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        
        <button
          type="submit"
          className="bg-gradient-to-r from-[#21b4ca] to-[#1a9db0] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none leading-relaxed"
          disabled={searchLoading}
        >
          {searchLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('searching')}</span>
            </div>
          ) : (
            t('find')
          )}
        </button>
        
        <button
          type="button"
          onClick={clearSearch}
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 leading-relaxed"
        >
          {t('clear')}
        </button>
      </form>

      {/* Search results count and error */}
      <div className="space-y-2">
        {searchError && (
          <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="leading-relaxed">{searchError}</span>
          </div>
        )}
        
        {searchResults && searchResults.length > 0 && (
          <div className="flex items-center gap-2 text-[#21b4ca] text-sm font-medium bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="leading-relaxed">
              {t('found_results', { count: searchResults.length })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageSearchForm;