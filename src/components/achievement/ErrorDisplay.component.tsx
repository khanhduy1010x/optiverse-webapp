import React from 'react';
import Text from '../common/Text.component';

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="flex justify-center items-center h-32">
      <Text className="text-red-500">{error}</Text>
    </div>
  );
};

export default ErrorDisplay; 