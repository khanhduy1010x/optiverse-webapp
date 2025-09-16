import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface MessageSearchFormProps {
  showMessageSearch: boolean;
  messageSearchQuery: string;
  setMessageSearchQuery: (query: string) => void;
  handleMessageSearchSubmit: (e: React.FormEvent) => void;
  clearSearch: () => void;
  searchLoading: boolean;
  searchError: string | null;
  searchResults: any[];
  messageRefs: React.MutableRefObject<any>;
  setHighlightedMessageId: (id: string | null) => void;
}

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
    <div className="p-4 border-b border-gray-200 bg-[#f8f9fa]">
      <form onSubmit={handleMessageSearchSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={messageSearchQuery}
          onChange={e => setMessageSearchQuery(e.target.value)}
          placeholder={t('search_in_conversation')}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#21b4ca]"
        />
        <button
          type="submit"
          className="bg-[#21b4ca] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1a9db0] disabled:opacity-50"
          disabled={searchLoading}
        >
          {searchLoading ? t('searching') : t('find')}
        </button>
        <button
          type="button"
          onClick={clearSearch}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600"
        >
          {t('clear')}
        </button>
      </form>

      {/* Search results */}
      {searchError && (
        <div className="text-red-500 text-sm mb-2">{searchError}</div>
      )}


    </div>
  );
};

export default MessageSearchForm;