import React from 'react';
import Text from '../common/Text.component';
import Icon from '../common/Icon/Icon.component';

const EmptyAchievements: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="trophy" size={32} className="text-gray-300" />
      </div>
      <Text className="text-gray-500 font-medium mb-1">Chưa có thành tựu nào</Text>
      <Text className="text-gray-400 text-sm max-w-md mx-auto">
        Hoàn thành nhiều nhiệm vụ để mở khóa thành tựu và nhận phần thưởng!
      </Text>
    </div>
  );
};

export default EmptyAchievements; 