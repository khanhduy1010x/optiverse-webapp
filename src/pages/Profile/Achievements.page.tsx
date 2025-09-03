import React from 'react';
import View from '../../components/common/View.component';
import Text from '../../components/common/Text.component';
import ProfileSidebar from './ProfileSidebar.component';
import useAchievements from '../../hooks/achievement/useAchievements.hook';
import AchievementList from '../../components/achievement/AchievementList.component';
import EmptyAchievements from '../../components/achievement/EmptyAchievements.component';
import Loader from '../../components/achievement/Loader.component';
import ErrorDisplay from '../../components/achievement/ErrorDisplay.component';
import {
  Achievement,
  UserAchievementWithDetails,
} from '../../types/achievement/achievement.type';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const AchievementsPage: React.FC = () => {
  const { t } = useAppTranslate('profile');
  const {
    unlockedAchievements,
    lockedAchievements,
    loading,
    error,
    selectedMenu,
    handleNavigate,
  } = useAchievements();

  const hasAchievements =
    (unlockedAchievements && unlockedAchievements.length > 0) ||
    (lockedAchievements && lockedAchievements.length > 0);

  return (
    <View className="w-full h-screen flex">
      <View className="flex flex-1 overflow-hidden">
        {/* Using the shared ProfileSidebar component */}
        <ProfileSidebar
          selectedMenu={selectedMenu}
          handleNavigate={handleNavigate}
        />

        {/* Main Content */}
        <View className={GROUP_CLASSNAMES.profileMainContent}>
          <div className="p-8">
            <h1 className="text-[22px] font-normal text-gray-800 pb-2">
              {t('my_achievements')}
            </h1>
            <div className="mb-2 text-[14px] text-gray-400 text:bold">
              {t('open_world_achievements_earn_rewards')}
            </div>
            <hr className="mb-6 border-gray-200" />

            <div className="bg-white rounded-xl shadow-sm p-5 mb-8">
              {loading ? (
                <Loader />
              ) : error ? (
                <ErrorDisplay error={error} />
              ) : hasAchievements ? (
                <View>
                  <AchievementList
                    title={t('unlocked')}
                    achievements={unlockedAchievements}
                    unlocked={true}
                  />

                  <AchievementList
                    title={t('locked')}
                    achievements={lockedAchievements}
                    unlocked={false}
                  />
                </View>
              ) : (
                <EmptyAchievements />
              )}
            </div>
          </div>
        </View>
      </View>
    </View>
  );
};

export default AchievementsPage;
