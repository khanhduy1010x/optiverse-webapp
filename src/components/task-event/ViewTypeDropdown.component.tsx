import React, { useRef } from 'react';

type ViewType = 'Day' | 'Week' | 'Month' | 'Year';
const VIEW_TYPES: ViewType[] = ['Day', 'Week', 'Month'];

interface ViewTypeDropdownProps {
  viewType: ViewType;
  setViewType: (type: ViewType) => void;
  showViewTypeDropdown: boolean;
  setShowViewTypeDropdown: (show: boolean) => void;
}

export const ViewTypeDropdown: React.FC<ViewTypeDropdownProps> = ({
  viewType,
  setViewType,
  showViewTypeDropdown,
  setShowViewTypeDropdown
}) => {
  return (
    <div className="bg-gray-100 rounded-md flex items-center p-1">
      {VIEW_TYPES.map(type => (
        <button
          key={type}
          onClick={() => setViewType(type)}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            viewType === type
              ? 'bg-white text-gray-800 font-medium shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}; 