import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_SECTIONS } from '../common/Navigation/navigation';
import Icon from '../common/Icon/Icon.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const AdminSidebar: React.FC = () => {
  const { t } = useAppTranslate('admin');
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Find admin section
  const adminSection = NAV_SECTIONS.find(
    section => section.path === '/admin/dashboard'
  );
  const adminSubsections = adminSection?.subsections || [];

  return (
    <div className="w-64 border-r border-gray-200 fixed left-16 top-14 h-[calc(100vh-56px)] overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('admin_dashboard')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t('system_management')}</p>
        </div>

        {/* Navigation items - Centered with proper spacing */}
        <div className="flex-1 flex flex-col pt-10 px-6 space-y-4 overflow-y-auto">
          {adminSubsections.map(subsection => (
            <button
              key={subsection.path}
              onClick={() => navigate(subsection.path)}
              className={`
                                px-6 py-3 rounded-lg text-left cursor-pointer transition-all duration-200 flex items-center
                                ${currentPath === subsection.path
                  ? 'bg-[#e7f6f7] text-[#21b4ca]'
                  : 'text-gray-700 hover:bg-gray-50'
                }
                            `}
            >
              <Icon
                name={subsection.icon || 'home'}
                size={18}
                className={`mr-3 ${currentPath === subsection.path ? 'text-[#21b4ca]' : 'text-gray-500'}`}
              />
              <span className="font-medium text-sm">{subsection.label}</span>
            </button>
          ))}
        </div>

        {/* Footer section */}
        <div className="px-6 py-4 border-t border-gray-200 h-[71px]">
          <div className="text-xs text-gray-500 text-center">
            <p>{t('admin_control_panel')}</p>
            <p className="mt-1">
              {t('copyright')} {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
