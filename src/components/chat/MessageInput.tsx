import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import ImagePreview from './ImagePreview';
import EmojiPicker from 'emoji-picker-react';
import {
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Brush as BrushIcon,
} from '@mui/icons-material';

import { MessageInputProps } from '../../types/chat/props/component.props';

const MessageInput: React.FC<MessageInputProps> = ({
  messageText,
  setMessageText,
  handleSendMessage,
  handleMessageChange,
  replyToMessage,
  renderReplyPreview,
  handleCancelReply,
  selectedImages,
  handleOpenFileDialog,
  handleRemoveImage,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  fileInputRef,
  messageInputRef,
  emojiPickerRef,
  handleFileChange,
  handleInputFocusEvent,
  handleInputBlurEvent,
  registerInputRef,
  handlePasteImage,
  isGroupChat = false,
  groupName,
  memberCount,
  onOpenDrawingBoard,
}) => {
  const { t } = useAppTranslate('chat');

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      handlePasteImage(imageFiles);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* Group chat indicator */}
      {isGroupChat && groupName && (
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>
            {t('messaging_in')} <strong>{groupName}</strong>
            {memberCount && ` (${memberCount} ${t('members')})`}
          </span>
        </div>
      )}
      {/* Reply preview */}
      {renderReplyPreview()}

      {/* Image previews */}
      {selectedImages.length > 0 && (
        <div className="mb-3">
          <ImagePreview
            images={selectedImages}
            onRemove={handleRemoveImage}
          />
        </div>
      )}

      {/* Message input */}
      <div className="flex items-center gap-2 relative">
        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attach file button */}
        <button
          onClick={handleOpenFileDialog}
          className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-[#21b4ca] hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          title={t('attach_file')}
        >
          <AttachFileIcon />
        </button>

        {/* Drawing button */}
        <button
          onClick={onOpenDrawingBoard}
          className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-[#21b4ca] hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          title="Mở bảng vẽ"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={el => {
              if (messageInputRef) {
                (messageInputRef as any).current = el;
              }
              registerInputRef(el);
            }}
            value={messageText}
            onChange={handleMessageChange}
            onFocus={handleInputFocusEvent}
            onBlur={handleInputBlurEvent}
            onPaste={handlePaste}
            placeholder={t('type_message')}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#21b4ca] focus:border-transparent"
            rows={1}
            style={{
              minHeight: '44px',
              maxHeight: '120px',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
        </div>

        {/* Emoji button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors flex-shrink-0 ${
            showEmojiPicker
              ? 'text-[#21b4ca] bg-blue-50'
              : 'text-gray-500 hover:text-[#21b4ca] hover:bg-gray-100'
          }`}
          title={t('add_emoji')}
        >
          😊
        </button>

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          disabled={!messageText.trim() && selectedImages.length === 0}
          className="flex items-center justify-center w-10 h-10 bg-[#21b4ca] text-white rounded-full hover:bg-[#1a9db0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          title={t('send_message')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-full right-0 mb-2 z-50"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={300}
              height={400}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;