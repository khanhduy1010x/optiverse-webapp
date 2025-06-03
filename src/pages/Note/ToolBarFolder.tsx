import React from 'react';

interface ToolBarFolderProps {
  setIsModalInputName: (value: boolean) => void;
  setCreateType: (type: 'folder' | 'note') => void;
}

const ToolBarFolder: React.FC<ToolBarFolderProps> = ({ setIsModalInputName, setCreateType }) => {
  return (
    <div className="flex justify-between items-center bg-white p-3">
      <button
        onClick={() => {
          setCreateType('note');
          setIsModalInputName(true);
        }}
        className="p-2"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            fill="#000"
          />
        </svg>
      </button>
      <button
        onClick={() => {
          setCreateType('folder');
          setIsModalInputName(true);
        }}
        className="p-2"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 16H16V14H18V12H16V10H14V12H12V14H14V16ZM4 20C3.45 20 2.97917 19.8042 2.5875 19.4125C2.19583 19.0208 2 18.55 2 18V6C2 5.45 2.19583 4.97917 2.5875 4.5875C2.97917 4.19583 3.45 4 4 4H10L12 6H20C20.55 6 21.0208 6.19583 21.4125 6.5875C21.8042 6.97917 22 7.45 22 8V18C22 18.55 21.8042 19.0208 21.4125 19.4125C21.0208 19.8042 20.55 20 20 20H4ZM4 18H20V8H11.175L9.175 6H4V18Z"
            fill="#000"
          />
        </svg>
      </button>
      <button className="p-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#000" />
        </svg>
      </button>
      <button className="p-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 8H4v4h8V8zm0 6H4v4h8v-4zm10-6h-8v4h8V8zm0 6h-8v4h8v-4z" fill="#000" />
        </svg>
      </button>
      <button className="p-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"
            fill="#000"
          />
        </svg>
      </button>
    </div>
  );
};

export default ToolBarFolder;