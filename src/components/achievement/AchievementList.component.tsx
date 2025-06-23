import React from 'react';
import { Achievement, UserAchievementWithDetails } from '../../types/achievement/achievement.type';
import View from '../common/View.component';
import Text from '../common/Text.component';
import Icon from '../common/Icon/Icon.component';
import AchievementCard from './AchievementCard.component';

interface AchievementListProps {
  title: string;
  achievements: Achievement[] | UserAchievementWithDetails[];
  unlocked: boolean;
}

const AchievementList: React.FC<AchievementListProps> = ({ title, achievements, unlocked }) => {
  if (!achievements || achievements.length === 0) return null;
  
  return (
    <View className={`${unlocked ? "mb-12" : "mb-6"}`}>
      <View className="flex items-center mb-5">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center mr-2
          ${unlocked ? 'bg-green-100' : 'bg-gray-100'}
        `}>
          <Icon 
            name="trophy" 
            size={20} 
            className={unlocked ? "text-green-600" : "text-gray-500"} 
          />
        </div>
        <Text className={`text-lg font-medium ${unlocked ? 'text-green-800' : 'text-gray-700'}`}>
          {title} <span className="text-sm font-normal text-gray-500">({achievements.length})</span>
        </Text>
      </View>
      
      <div className="flex flex-wrap">
        {achievements.map(item => {
          // Check if item is a UserAchievementWithDetails by looking for achievement_id property
          const isUserAchievement = 'achievement_id' in item && typeof item.achievement_id === 'object';
          const achievement = isUserAchievement ? (item as UserAchievementWithDetails).achievement_id : item as Achievement;
          const unlockedAt = isUserAchievement ? (item as UserAchievementWithDetails).unlocked_at : undefined;
          
          return (
            <AchievementCard 
              key={achievement._id} 
              achievement={achievement} 
              unlocked={unlocked}
              unlocked_at={unlockedAt}
            />
          );
        })}
      </div>
    </View>
  );
};

export default AchievementList; 