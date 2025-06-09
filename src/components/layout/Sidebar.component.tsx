import React, { useState } from 'react';

import { NAV_SECTIONS } from '../common/Navigation/navigation';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/sidebar.slice';
import Icon from '../common/Icon/Icon.component';
import NavButton from '../common/Button/NavButton';

interface SliderBarProps {
  activeSection: string;
  onNavClick: (path: string) => void;
}

const SliderBar: React.FC<SliderBarProps> = ({ activeSection, onNavClick }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.sidebar.isOpen);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (path: string) => {
    setExpandedSections((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        isSidebarOpen ? 'w-56' : 'w-16'
      } border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col h-full shadow-lg bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900`}
    >
      <div className="flex justify-end mb-6">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-full hover:bg-gray-200 flex items-center justify-center dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <Icon
            name="sidebar"
            className="text-gray-600 flex items-center justify-center dark:text-gray-300"
          />
        </button>
      </div>

      {isSidebarOpen && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.path}>
              <NavButton
                label={
                  <div className="flex items-center gap-3">
                    <Icon
                      name={section.icon || 'home'}
                      size={24}
                      className="text-gray-600 dark:text-gray-300"
                      color='#fff'
                    />
                    {isSidebarOpen && (
                      <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm tracking-wide">
                        {t(section.label)}
                      </span>
                    )}
                    {isSidebarOpen && section.subsections && (
                      <Icon
                        name={expandedSections.includes(section.path) ? 'unfoldLess' : 'unfoldMore'}
                        size={16}
                        className="ml-auto text-gray-500 dark:text-gray-400"
                      />
                    )}
                  </div>
                }
                isActive={activeSection === section.path}
                onClick={() => {
                  if (section.subsections) {
                    toggleSection(section.path);
                  } else {
                    onNavClick(section.path);
                  }
                }}
                className={`w-full py-3 px-4 rounded-xl transition-all duration-300 ease-in-out ${
                  activeSection === section.path
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              />
              {isSidebarOpen &&
                section.subsections &&
                expandedSections.includes(section.path) && (
                  <div className="ml-8 mt-2 space-y-1">
                    {section.subsections.map((sub) => (
                      <NavButton
                        key={sub.path}
                        label={
                          <div className="flex items-center gap-2">
                            <Icon
                              name={sub.icon || 'home'}
                              size={18}
                              className="text-gray-500 dark:text-gray-400"
                            />
                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                              {t(sub.label)}
                            </span>
                          </div>
                        }
                        isActive={activeSection === sub.path}
                        onClick={() => onNavClick(sub.path)}
                        className={`w-full py-2 px-3 rounded-lg transition-all duration-300 ease-in-out ${
                          activeSection === sub.path
                            ? 'bg-blue-400 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SliderBar;