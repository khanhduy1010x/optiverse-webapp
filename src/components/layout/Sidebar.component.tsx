import React from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../common/Icon/Icon.component';
import { NAV_SECTIONS, WORKSPACE_ONLY_SECTIONS, MARKETPLACE_SECTIONS, getMainSidebarActiveSection } from '../common/Navigation/navigation';
import './Sidebar.css';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus.hook';

interface SliderBarProps {
  activeSection: string;
  onNavClick: (path: string) => void;
}

const SliderBar: React.FC<SliderBarProps> = ({ activeSection, onNavClick }) => {
  const normalizedActiveSection = getMainSidebarActiveSection(activeSection);
  const { isAdmin } = useAuthStatus();
  const location = useLocation();
  const workspacePrefixMatch = location.pathname.match(/^\/workspace\/([^/]+)/);
  const workspacePrefix = workspacePrefixMatch ? `/workspace/${workspacePrefixMatch[1]}` : '';
  const isMarketplace = location.pathname.startsWith('/marketplace');

  let baseSections = NAV_SECTIONS.filter(section => {
    if (section.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  if (workspacePrefix) {
    // When inside a workspace, remove some global sections and also hide admin-only sections
    baseSections = baseSections.filter(s => s.path !== '/friends' && s.path !== '/settings' && s.path !== '/user-profile' && !s.adminOnly);
    baseSections = [
      ...baseSections,
      ...WORKSPACE_ONLY_SECTIONS,
    ];
  }

  if (isMarketplace) {
    baseSections = MARKETPLACE_SECTIONS;
  }

  return (
    <div>
      <div className={` w-16 bg-black fixed  h-full top-14 py-18 flex flex-col items-center ${isMarketplace ? 'justify-start' : 'justify-between'} z-10`}>
        <div className={`slidebar-container flex flex-col items-center ${isMarketplace ? 'justify-start gap-10' : 'justify-between'} flex-1 w-full`}>
          {baseSections.map((section) => (
            <div key={section.path} className="relative group w-full flex justify-center my-2 ">
              <button
                onClick={() => {
                  if (isMarketplace) {
                    onNavClick(section.path);
                    return;
                  }
                  const path = section.path.startsWith('/workspace-')
                    ? `${workspacePrefix}${section.path.replace('/workspace-', '/')}`
                    : `${workspacePrefix}${section.path}`;
                  onNavClick(path);
                }}
                className={`group/button slidebar-container flex items-center cursor-pointer justify-center w-12 h-12 rounded-lg transition-all duration-300 ${normalizedActiveSection === section.path
                  ? 'bg-white'
                  : 'hover:bg-white'
                  }`}
              >
                <Icon
                  name={section.icon || 'home'}
                  size={36}
                  className={`group-hover/button:text-black transition-all duration-300 ${normalizedActiveSection === section.path ? 'text-black' : 'text-white'
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
