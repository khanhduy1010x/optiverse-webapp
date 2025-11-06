import React from 'react';
import View from '../../../components/common/View.component';
import Icon from '../../../components/common/Icon/Icon.component';
import { IconName } from '../../../assets/icons';
import { useNavigate } from 'react-router-dom';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

interface FlashcardWorkspaceSidebarProps {
  currentSelected: 'flashcard-deck' | 'flashcard-statistic';
  workspaceId: string;
}

const FlashcardWorkspaceSidebar: React.FC<FlashcardWorkspaceSidebarProps> = ({
  currentSelected,
  workspaceId,
}) => {
  const navigate = useNavigate();
  const { t } = useAppTranslate('flashcard');
  const menuItems = [
    {
      id: 'flashcard-deck',
      label: t('flashcard'),
      path: `/workspace/${workspaceId}/flashcard-deck`,
      icon: 'flashcard' as IconName,
    },
    {
      id: 'flashcard-statistic',
      label: t('statistic'),
      path: `/workspace/${workspaceId}/flashcard-statistic`,
      icon: 'statistic' as IconName,
    },
  ];

  return (
    <View className="w-64 border-r border-gray-200">
      <div className="h-full flex flex-col">
        {/* Header section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('flashcard_menu')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('flashcard_management')}
          </p>
        </div>

        {/* Navigation items */}
        <div className="flex-1 flex flex-col pt-10 px-6 space-y-4">
          {menuItems.map(menu => (
            <button
              key={menu.id}
              onClick={() => navigate(menu.path)}
              className={`
                px-6 py-3 rounded-lg text-left cursor-pointer transition-all duration-200 flex items-center
                ${
                  currentSelected === menu.id
                    ? 'bg-[#e7f6f7] text-[#21b4ca]'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon
                name={menu.icon}
                size={24}
                className={`mr-3 ${currentSelected === menu.id ? 'text-[#21b4ca]' : 'text-gray-500'}`}
              />
              <span className="font-medium text-sm">{menu.label}</span>
            </button>
          ))}
        </div>

        {/* Footer section */}
        <div className="p-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            {t('flashcard_settings')}
          </div>
        </div>
      </div>
    </View>
  );
};

export default FlashcardWorkspaceSidebar;
