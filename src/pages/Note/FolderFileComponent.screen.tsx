import React from 'react';
import { FolderFileComponentProps } from '../../types/note/props/component.props';


const FolderFileComponent: React.FC<FolderFileComponentProps> = ({ type, title, updatedAt, noteCount }) => {
  return (
    <div className="flex items-center py-3 border-b border-gray-200">
      <div className="pr-5">
        {type === 'folder' ? (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M5.33332 26.6666C4.59999 26.6666 3.97221 26.4055 3.44999 25.8833C2.92777 25.3611 2.66666 24.7333 2.66666 24V7.99998C2.66666 7.26665 2.92777 6.63887 3.44999 6.11665C3.97221 5.59442 4.59999 5.33331 5.33332 5.33331H13.3333L16 7.99998H26.6667C27.4 7.99998 28.0278 8.26109 28.55 8.78331C29.0722 9.30554 29.3333 9.93331 29.3333 10.6666V24C29.3333 24.7333 29.0722 25.3611 28.55 25.8833C28.0278 26.4055 27.4 26.6666 26.6667 26.6666H5.33332ZM5.33332 24H26.6667V10.6666H14.9L12.2333 7.99998H5.33332V24Z"
              fill="#000"
            />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M9.5 25.6H22.5V22.4H9.5V25.6ZM9.5 19.2H22.5V16H9.5V19.2ZM6.25 32C5.35625 32 4.59115 31.6867 3.95469 31.06C3.31823 30.4333 3 29.68 3 28.8V3.2C3 2.32 3.31823 1.56667 3.95469 0.94C4.59115 0.313333 5.35625 0 6.25 0H19.25L29 9.6V28.8C29 29.68 28.6818 30.4333 28.0453 31.06C27.4089 31.6867 26.6437 32 25.75 32H6.25ZM17.625 11.2V3.2H6.25V28.8H25.75V11.2H17.625Z"
              fill="#000"
            />
          </svg>
        )}
      </div>
      <div className="flex-1 flex justify-between items-center">
        <div>
          <p className="text-base font-bold">{title}</p>
          <p className="text-sm text-gray-500">{updatedAt}</p>
        </div>
        {type === 'folder' && noteCount !== undefined && (
          <p className="text-sm text-gray-500">{noteCount} items</p>
        )}
      </div>
    </div>
  );
};

export default FolderFileComponent;