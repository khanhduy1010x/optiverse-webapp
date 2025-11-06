import React from 'react';

interface WorkspaceToolBarProps {
    onCreateFolder: () => void;
    onCreateNote: () => void;
}

const WorkspaceToolBar: React.FC<WorkspaceToolBarProps> = ({ onCreateFolder, onCreateNote }) => {
    return (
        <div className="flex items-center justify-around bg-white px-4 py-3 border-t border-gray-200 shadow-sm">
            {/* Create Folder Button */}
            <button
                onClick={onCreateFolder}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors group flex-1"
                title="Create Folder"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000" className="group-hover:fill-gray-600">
                    <path
                        d="M14 16H16V14H18V12H16V10H14V12H12V14H14V16ZM4 20C3.45 20 2.97917 19.8042 2.5875 19.4125C2.19583 19.0208 2 18.55 2 18V6C2 5.45 2.19583 4.97917 2.5875 4.5875C2.97917 4.19583 3.45 4 4 4H10L12 6H20C20.55 6 21.0208 6.19583 21.4125 6.5875C21.8042 6.97917 22 7.45 22 8V18C22 18.55 21.8042 19.0208 21.4125 19.4125C21.0208 19.8042 20.55 20 20 20H4ZM4 18H20V8H11.175L9.175 6H4V18Z"
                    />
                </svg>
                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">Folder</span>
            </button>

            {/* Create Note Button */}
            <button
                onClick={onCreateNote}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors group flex-1"
                title="Create Note"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000" className="group-hover:fill-gray-600">
                    <path
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                    />
                </svg>
                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">Note</span>
            </button>
        </div>
    );
};

export default WorkspaceToolBar;
