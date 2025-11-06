import React from 'react';
import { FolderFileComponentProps } from '../../types/note/props/component.props';
import { truncateText } from '../../utils/string.utils';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const FolderFileComponent: React.FC<FolderFileComponentProps> = ({
  isSharedView,
  type,
  title,
  updatedAt,
  noteCount,
  isShared,
  permission,
  ownerInfo,
  isActive,
  onContextMenu,
  onLeave,
}) => {
  const { folderStack } = useSelector((state: RootState) => state.items);

  const handleLeaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLeave) {
      onLeave();
    }
  };

  const showLeaveButton = folderStack.length === 0;

  return (
    <div className={`flex items-center py-3 px-4 border-b border-gray-100 ${isActive ? 'bg-[#e6f7f9]' : 'hover:bg-gray-50'}   cursor-pointer relative`}>
      <div className='absolute top-1/2 -translate-y-1/2 right-6 z-10 justify-center items-center flex flex-col'>
        {isSharedView && isShared && type === 'folder' && (
          <div className="">
            <span className="text-xs bg-[#e6f7f9] text-[#21b4ca] px-1.5 py-0.5 rounded shadow-sm">
              {permission === 'edit' ? 'Edit' : 'View'}
            </span>
          </div>
        )}

        {isSharedView && isShared && type === 'file' && (
          <span className="text-xs bg-[#e6f7f9] text-[#21b4ca] px-1.5 py-0.5 rounded shadow-sm ">
            {permission === 'edit' ? 'Edit' : 'View'}
          </span>
        )}
        {isSharedView && isShared && onLeave && showLeaveButton && (
          <div>
            <button
              onClick={handleLeaveClick}
              className="text-xs text-red-600 cursor-pointer hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 mr-1 mt-2"
              title="Leave"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="mr-3 flex-shrink-0">
        {type === 'folder' ? (
          <div className='flex flex-col justify-center items-center'>
            <div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6H12L10 4Z"
                  fill="#FFB800"
                />
              </svg>
            </div>
            {type === 'folder' && noteCount !== undefined && (
              <div className="text-[10px] text-gray-500  leading-[24px]">
                {noteCount} items
              </div>
            )}
          </div>


        ) : (
          <div className='flex flex-col justify-center items-center'>
            <div>

              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className='text-[#21b4ca]'>
                <path
                  d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                  fill="#21b4ca"
                />
                <path
                  d="M14 2V8H20"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 ">
        <div className="font-medium text-gray-900 flex items-center justify-between">
          <div className='flex items-center justify-between'>
            <div className="truncate" title={title}>
              <span className='leading-[24px] text-sm flex items-center h-[24px]'>
                {truncateText(title)}
              </span>
            </div>

          </div>


        </div>
        <div className="text-sm text-gray-500">
          <div className="truncate">
            {updatedAt}
          </div>
          {isSharedView && isShared && ownerInfo && (
            <div className="text-xs text-gray-500 truncate">
              Shared by: {ownerInfo.name || ownerInfo.id}
            </div>
          )}
        </div>
      </div>



      <div className='flex items-center flex-col relative'>

        {onContextMenu && (
          <div
            onClick={onContextMenu}
            className="px-2 py-1 hover:bg-gray-200 rounded cursor-pointer ml-2 flex-shrink-0 transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderFileComponent;