import React from 'react';
import Icon from '../common/Icon/Icon.component';
import { NAV_SECTIONS, getMainSidebarActiveSection } from '../common/Navigation/navigation';
import './Sidebar.css';

interface SliderBarProps {
  activeSection: string;
  onNavClick: (path: string) => void;
}

const SliderBar: React.FC<SliderBarProps> = ({ activeSection, onNavClick }) => {
  // Xác định section nào đang active dựa trên path hiện tại
  const normalizedActiveSection = getMainSidebarActiveSection(activeSection);

  return (
    <div>
      <div className="slidebar-container w-16 bg-black h-screen py-18 flex flex-col items-center justify-between relative z-10">
        <div className="slidebar-container flex flex-col items-center justify-between flex-1 w-full">
          {NAV_SECTIONS.map((section) => (
            <div key={section.path} className="relative group w-full flex justify-center my-2 slidebar-container">
              <button
                onClick={() => onNavClick(section.path)}
                className={`group flex items-center cursor-pointer justify-center w-12 h-12 rounded-lg transition-all duration-300 ${normalizedActiveSection === section.path
                  ? 'bg-white'
                  : 'hover:bg-white'
                  }`}
              >
                <Icon
                  name={section.icon || 'home'}
                  size={36}
                  className={`group-hover:text-black ${normalizedActiveSection === section.path ? 'text-black' : 'text-white'
                    }`}
                />
              </button>

              <div className="text-label-container absolute top-0 left-[100%] h-full -z-10 pointer-events-none overflow-visible">
                <div
                  className="sidebar-label bg-black text-white py-1 pl-2 pr-4 whitespace-nowrap rounded-br-lg rounded-tr-lg absolute top-1/2 -z-1"
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
