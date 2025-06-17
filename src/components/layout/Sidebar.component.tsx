import React from 'react';
import Icon from '../common/Icon/Icon.component';
import { NAV_SECTIONS } from '../common/Navigation/navigation';
import './Sidebar.css';

interface SliderBarProps {
  activeSection: string;
  onNavClick: (path: string) => void;
}

const SliderBar: React.FC<SliderBarProps> = ({ activeSection, onNavClick }) => {
  return (
    <div>
      <div className="slidebar-container w-16  bg-black h-screen py-18 flex flex-col items-center justify-between  relative z-10">
        <div className="slidebar-container flex flex-col items-center justify-between flex-1 w-full">
          {NAV_SECTIONS.map((section) => (
            <div key={section.path} className="relative group w-full flex justify-center my-2 slidebar-container ">
              <button
                onClick={() => onNavClick(section.path)}
                className={`group flex items-center cursor-pointer justify-center w-12 h-12 rounded-lg transition-all duration-300 ${activeSection === section.path
                  ? 'bg-white'
                  : 'hover:bg-white '
                  }`}
              >
                <Icon
                  name={section.icon || 'home'}
                  size={36}
                  className={`group-hover:text-black ${activeSection === section.path ? 'text-black ' : 'text-white '
                    }`}
                />

              </button>

              <div className="text-label-container absolute top-0 right-0 h-full -z-10 pointer-events-none overflow-visible">
                <div
                  className="sidebar-label bg-black text-white py-1 pr-2 whitespace-nowrap rounded-br-lg rounded-tr-lg absolute top-1/2 -z-1"
                  style={{
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    left: '0'
                  }}
                >
                  <span className="-z-10 text-sm">{section.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SliderBar;
