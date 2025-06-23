import React from 'react';
import Text from '../common/Text.component';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-32">
      <Text className="text-gray-500">Đang tải thành tựu...</Text>
    </div>
  );
};

export default Loader; 