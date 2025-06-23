import React, { useState } from 'react';
import { Achievement } from '../../types/achievement/achievement.type';
import Text from '../common/Text.component';
import Icon from '../common/Icon/Icon.component';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  unlocked_at?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, unlocked, unlocked_at }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div 
      className="relative m-2"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main Card */}
      <div className={`
        w-[140px] h-[160px]
        ${unlocked 
          ? 'bg-white shadow-md hover:shadow-lg' 
          : 'bg-gray-50 shadow-sm'}
        rounded-xl overflow-hidden transition-all duration-300
        border ${unlocked ? 'border-blue-100' : 'border-gray-100'} hover:border-blue-200
        flex flex-col items-center justify-center cursor-pointer
        relative
      `}>
        {/* Status indicator */}
        {unlocked && (
          <div className="absolute top-3 right-3 flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm mr-1"></div>
          </div>
        )}
        
        {/* Achievement Icon with gradient background */}
        <div className={`
          w-16 h-16 flex items-center justify-center mb-3
          ${unlocked 
            ? 'bg-gradient-to-br from-blue-50 to-green-50 rounded-full shadow-inner border border-blue-100' 
            : 'bg-gray-100 rounded-full filter grayscale opacity-70 border border-gray-200'}
        `}>
          {(achievement.badge_image || achievement.icon_url) ? (
            <img 
              src={achievement.badge_image || achievement.icon_url} 
              alt={achievement.title} 
              className={`w-10 h-10 object-contain ${!unlocked && 'opacity-60'}`}
            />
          ) : (
            <Icon 
              name="trophy" 
              size={28} 
              className={unlocked ? 'text-amber-500' : 'text-gray-400'} 
            />
          )}
        </div>
        
        {/* Title */}
        <Text className={`text-xs font-medium text-center px-3 line-clamp-2
          ${unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
          {achievement.title}
        </Text>
      
      </div>
      
      {/* Hover Detail Popup */}
      {isHovering && (
        <div className="absolute z-20 -right-64 top-0 w-60 bg-white shadow-lg rounded-lg border border-blue-100 p-4 animate-fadeIn">
          <div className="absolute -left-2 top-8 transform rotate-45 w-3 h-3 bg-white border-l border-t border-blue-100"></div>
          
          {/* Header with icon and title */}
          <div className="flex items-center mb-3 border-b border-gray-50">
           
            <Text className="font-semibold text-gray-800 text-sm leading-tight">{achievement.title}</Text>
          </div>
          
          {/* Description */}
          <Text className="text-xs text-gray-600 mb-3 leading-relaxed">{achievement.description}</Text>
          
          {/* Unlocked date - only show if unlocked */}
          {unlocked && unlocked_at && (
            <div className="flex items-center mb-3 bg-blue-50 rounded-md p-2">
              <Icon name="calendar" size={30} className="text-blue-500 mr-2" />
              <Text className="text-xs text-gray-700">
                Đạt được: {formatDate(unlocked_at)}
              </Text>
            </div>
          )}
          
      
        </div>
      )}
    </div>
  );
};

export default AchievementCard; 