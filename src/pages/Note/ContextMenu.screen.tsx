import React, { useRef, useEffect } from 'react';
import { ContextMenuProps } from '../../types/note/props/component.props';
import { useContextMenu } from '../../hooks/note/useContextMenu.hook';

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onRename,
  onDelete,
  onClose,
}) => {
  const { menuRef } = useContextMenu(onClose);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white shadow-lg rounded-lg z-50 min-w-32 overflow-hidden"
      style={{ top: y, left: x }}
    >
      <button
        onClick={onRename}
        className="w-full text-left px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm text-gray-700 transition-colors duration-150 flex items-center"
      >
        Rename
      </button>
      <hr className="border-gray-100" />
      <button
        onClick={onDelete}
        className="w-full text-left px-3 py-2 hover:bg-red-50 cursor-pointer text-sm text-red-600 transition-colors duration-150 flex items-center gap-2"
      >
        Delete
      </button>
      <hr className="border-gray-100" />
      <button
        onClick={onClose}
        className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-500 transition-colors duration-150 flex items-center gap-2"
      >
        Cancel
      </button>
    </div>
  );
};
