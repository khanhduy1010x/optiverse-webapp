import React from 'react';
import View from '../../components/common/View.component';
import Text from '../../components/common/Text.component';
import ProfileSidebar from './ProfileSidebar.component';
import useAchievements from '../../hooks/achievement/useAchievements.hook';
import AchievementList from '../../components/achievement/AchievementList.component';
import EmptyAchievements from '../../components/achievement/EmptyAchievements.component';
import Loader from '../../components/achievement/Loader.component';
import ErrorDisplay from '../../components/achievement/ErrorDisplay.component';
import { Achievement, UserAchievementWithDetails } from '../../types/achievement/achievement.type';

const AchievementsPage: React.FC = () => {
  const {
    unlockedAchievements,
    lockedAchievements,
    loading,
    error,
    selectedMenu,
    handleNavigate
  } = useAchievements();

  const hasAchievements =
    (unlockedAchievements && unlockedAchievements.length > 0) ||
    (lockedAchievements && lockedAchievements.length > 0);

  return (
    <View className="flex w-full min-h-screen bg-gray-50">
      {/* Using the shared ProfileSidebar component */}
      <ProfileSidebar selectedMenu={selectedMenu} handleNavigate={handleNavigate} />

      <View className="flex-1 p-4 md:p-6">
        <h1 className="text-[22px] font-normal text-gray-800  pb-2">My Achievements</h1>
        <div className="mb-2 text-[14px] text-gray-400  text:bold">
          Open the world achievements and earn rewards
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 mb-8">
          {loading ? (
            <Loader />
          ) : error ? (
            <ErrorDisplay error={error} />
          ) : hasAchievements ? (
            <View>
              <AchievementList
                title="Unlocked"
                achievements={unlockedAchievements}
                unlocked={true}
              />

              <AchievementList
                title="Locked"
                achievements={lockedAchievements}
                unlocked={false}
              />
            </View>
          ) : (
            <EmptyAchievements />
          )}
        </div>
      </View>
    </View>
  );
};

export default AchievementsPage; 