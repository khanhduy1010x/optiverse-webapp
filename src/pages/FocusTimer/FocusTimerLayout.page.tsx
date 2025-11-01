import React from 'react';
import { Outlet } from 'react-router-dom';
import View from '../../components/common/View.component';
import FocusTimerSidebar from './FocusTimerSidebar.component';
import { useFocusTimerNavigation } from '../../hooks/focus-timer/useFocusTimerNavigation.hook';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const FocusTimerLayout: React.FC = () => {
  const { selectedMenu, handleNavigate } = useFocusTimerNavigation();
  const { t } = useAppTranslate('focus');

  return (
    <View className="w-full dark:border-gray-700 flex h-full">
      {/* Sidebar and Main Content */}
      <View className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar for FocusTimer */}
        <FocusTimerSidebar
          selectedMenu={selectedMenu}
          handleNavigate={handleNavigate}
        />

        {/* Main Content - Using Outlet for nested routes */}
        <View className={'flex-1'}>
          <Outlet />
        </View>
      </View>
    </View>
  );
};

export default FocusTimerLayout;
