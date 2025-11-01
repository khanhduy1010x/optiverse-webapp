import React from 'react';
import { useNavigate } from 'react-router-dom';
import View from '../../components/common/View.component';
import { useUserAchievement } from '../../hooks/user-achievement/useUserAchievement.hook';
import ProfileSidebar from '../Profile/ProfileSidebar.component';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import AchievementList from '../../components/user-achievement/AchievementList.component';

const UserAchievementPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAppTranslate('profile');
  const selectedMenu = 'achievements';

  const {
    unlockedAchievements,
    lockedAchievements,
    loading,
    error,
    refreshAchievements,
    clearError
  } = useUserAchievement();

  const handleNavigate = (menu: string, path: string) => {
    navigate(path);
  };

  return (
    <View className="w-full dark:border-gray-700 rounded-lg h-full overflow-hidden">
      {/* Sidebar and Main Content */}
      <View className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <ProfileSidebar
          selectedMenu={selectedMenu}
          handleNavigate={handleNavigate}
        />

        {/* Main Content */}
        <View className={GROUP_CLASSNAMES.profileMainContent}>
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="text-[22px] text-gray-800 font-semibold mb-2">
                Achievements
              </div>
              <div className="text-[14px] text-gray-400">
                Track your progress and unlock new achievements
              </div>
            </div>

            <hr className="mb-8 border-gray-200" />

            {/* Achievement List */}
            <AchievementList
              unlockedAchievements={unlockedAchievements}
              lockedAchievements={lockedAchievements}
              loading={loading}
              error={error}
              onRefresh={refreshAchievements}
              onClearError={clearError}
            />
          </div>
        </View>
      </View>
    </View>
  );
};

export default UserAchievementPage;