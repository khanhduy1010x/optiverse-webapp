import React from 'react';
import { ToolBarFolderProps } from '../../types/note/props/component.props';

const ToolBarFolder: React.FC<ToolBarFolderProps> = ({
  setIsModalInputName,
  setCreateType,
  onToggleSharedView,
  isSharedView = false,
  onImportNote
}) => {
  const handleCreateFolder = () => {
    setCreateType('folder');
    setIsModalInputName(true);
  };

  const handleCreateNote = () => {
    setCreateType('note');
    setIsModalInputName(true);
  };

  const handleImportNote = () => {
    if (onImportNote) {
      onImportNote();
    }
  };

  return (
    <div className="flex justify-between items-center bg-white p-3">
      <button
        onClick={handleCreateFolder}
        className="p-2 cursor-pointer"
        disabled={isSharedView}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill={isSharedView ? "#CCCCCC" : "#000"}>
          <path
            d="M14 16H16V14H18V12H16V10H14V12H12V14H14V16ZM4 20C3.45 20 2.97917 19.8042 2.5875 19.4125C2.19583 19.0208 2 18.55 2 18V6C2 5.45 2.19583 4.97917 2.5875 4.5875C2.97917 4.19583 3.45 4 4 4H10L12 6H20C20.55 6 21.0208 6.19583 21.4125 6.5875C21.8042 6.97917 22 7.45 22 8V18C22 18.55 21.8042 19.0208 21.4125 19.4125C21.0208 19.8042 20.55 20 20 20H4ZM4 18H20V8H11.175L9.175 6H4V18Z"
          />
        </svg>
      </button>
      <button
        onClick={handleCreateNote}
        className="p-2 cursor-pointer"
        disabled={isSharedView}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill={isSharedView ? "#CCCCCC" : "#000"}>
          <path
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
          />
        </svg>
      </button>
      <button
        onClick={handleImportNote}
        className="p-2 cursor-pointer"
        disabled={isSharedView}
        title="Import Note từ File"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill={isSharedView ? "#CCCCCC" : "#000"}>
          <path d="M9 16V10H5L12 3L19 10H15V16H9ZM5 20V18H19V20H5Z" />
        </svg>
      </button>
      <button
        className="p-2 cursor-pointer"
        onClick={onToggleSharedView}
        title={isSharedView ? "Back to My Notes" : "Shared Notes & Folders"}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
            fill={isSharedView ? "#21b4ca" : "#000"}
          />
        </svg>
      </button>

    </div>
  );
};

export default ToolBarFolder;