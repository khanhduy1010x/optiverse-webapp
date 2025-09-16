import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import ImagePreview from './ImagePreview';
import EmojiPicker from 'emoji-picker-react';
import {
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface MessageInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => void;
  handleMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  replyToMessage: any;
  renderReplyPreview: () => React.ReactNode;
  handleCancelReply: () => void;
  selectedImages: File[];
  handleOpenFileDialog: () => void;
  handleRemoveImage: (index: number) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  handleEmojiClick: (emojiData: any) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  messageInputRef: React.RefObject<HTMLTextAreaElement>;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputFocusEvent: () => void;
  handleInputBlurEvent: () => void;
  registerInputRef: (ref: HTMLTextAreaElement | null) => void;
}

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
}) => {
  const { t } = useAppTranslate('chat');

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* Reply preview */}
      {replyToMessage && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-[#21b4ca]">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {renderReplyPreview()}
            </div>
            <button
              onClick={handleCancelReply}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>
      )}

      {/* Image previews */}
      {selectedImages.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {selectedImages.map((image, index) => (
              <ImagePreview
                key={index}
                file={image}
                onRemove={() => handleRemoveImage(index)}
              />
            ))}
          </div>
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