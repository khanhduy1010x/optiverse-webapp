import React from 'react';
import Icon from '../common/Icon/Icon.component';
import { NAV_SECTIONS } from '../common/Navigation/navigation';

interface SliderBarProps {
  activeSection: string;
  onNavClick: (path: string) => void;
}

const SliderBar: React.FC<SliderBarProps> = ({ activeSection, onNavClick }) => {
  return (
    <div className="w-16 bg-black h-screen py-18 flex flex-col items-center justify-between rounded-tr-xl rounded-br-xl ">
      <div className="flex flex-col items-center justify-between flex-1 w-full">
        {NAV_SECTIONS.map((section) => (
          <button
            key={section.path}
            onClick={() => onNavClick(section.path)}
            className={`flex items-center cursor-pointer justify-center w-12 h-12 rounded-lg transition-all duration-300 ${activeSection === section.path
              ? 'bg-gray-800'
              : 'hover:bg-gray-700'
              }`}
          >
            <Icon
              name={section.icon || 'home'}
              size={36}
              className={`${activeSection === section.path ? 'text-white' : 'text-gray-300'
                }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SliderBar;
