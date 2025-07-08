import React, { useRef, useEffect } from 'react';
import { ContextMenuProps } from '../../types/note/props/component.props';
import { useContextMenu } from '../../hooks/note/useContextMenu.hook';

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isSharedView,
  x,
  y,
  onRename,
  onDelete,
  onShare,
  onSendToChat,
  onClose,
  item,
}) => {
  const { menuRef } = useContextMenu(onClose);

  if (isSharedView) {
    return;
  }

  return (
    <div
      ref={menuRef}
      className="fixed bg-white shadow-lg rounded-lg z-50 min-w-32 overflow-hidden"
      style={{ top: y, left: x }}
    >
      <>
        <button
          onClick={onRename}
          className="w-full text-left px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm text-gray-700 transition-colors duration-150 flex items-center"
        >
          <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
          Rename
        </button>
        <hr className="border-gray-100" />
      </>


      <>
        <button
          onClick={onShare}
          className="w-full text-left px-3 py-2 cursor-pointer hover:bg-[#e6f7f9] text-sm text-[#21b4ca] transition-colors duration-150 flex items-center gap-2"
        >
          <svg className='text-[#21b4ca]' width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
          </svg>
          <span>Share</span>
        </button>
        <hr className="border-gray-100" />
      </>

      {item?.type === 'file' && (
        <>
          <button
            onClick={onSendToChat}
            className="w-full text-left px-3 py-2 cursor-pointer hover:bg-[#e6f7f9] text-sm text-[#21b4ca] transition-colors duration-150 flex items-center gap-2"
          >
            <svg className='text-[#21b4ca]' width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
            <span>Send to Chat</span>
          </button>
          <hr className="border-gray-100" />
        </>
      )}


      <>
        <button
          onClick={onDelete}
          className="w-full text-left px-3 py-2 hover:bg-red-50 cursor-pointer text-sm text-red-600 transition-colors duration-150 flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
          <span>Delete</span>
        </button>
        <hr className="border-gray-100" />
      </>

      <button
        onClick={onClose}
        className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-500 transition-colors duration-150 flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
        <span>Cancel</span>
      </button>
    </div>
  );
};
