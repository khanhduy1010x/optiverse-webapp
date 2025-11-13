import React from 'react';
import { truncateText } from '../../../utils/string.utils';

interface WorkspaceFolderFileItemProps {
    type: 'folder' | 'file';
    title?: string;
    updatedAt: string;
    noteCount?: number;
    isActive: boolean;
    onContextMenu: (e: React.MouseEvent) => void;
    showContextButton?: boolean;
}

const WorkspaceFolderFileItem: React.FC<WorkspaceFolderFileItemProps> = ({
    type,
    title,
    updatedAt,
    noteCount,
    isActive,
    onContextMenu,
    showContextButton = true,
}) => {
    return (
        <div
            className={`flex items-center py-3 px-4 border-b border-gray-100 ${isActive ? 'bg-[#e6f7f9]' : 'hover:bg-gray-50'} cursor-pointer relative`}
        >
            <div className="mr-3 flex-shrink-0">
                {type === 'folder' ? (
                    <div className="flex flex-col justify-center items-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M10 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6H12L10 4Z"
                                fill="#FFB800"
                            />
                        </svg>
                        {noteCount !== undefined && <div className="text-[10px] text-gray-500 leading-[24px]">{noteCount} items</div>}
                    </div>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                            fill="#21b4ca"
                        />
                        <path d="M14 2V8H20" fill="#FFFFFF" />
                    </svg>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">
                    <span className="leading-[24px] text-sm flex items-center h-[24px]">{truncateText(title || '')}</span>
                </div>
                <div className="text-sm text-gray-500">
                    <div className="truncate">{updatedAt}</div>
                </div>
            </div>
            {showContextButton && (
                <div className="flex items-center flex-col relative">
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
                </div>
            )}
        </div>
    );
};

export default WorkspaceFolderFileItem;
