import React from 'react';
import { ErrorDisplayProps } from '../../../types/friend/props/component.props';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, loading }) => {
  const { t } = useAppTranslate('friend');

  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-medium">{t('error')}</span>
      </div>
      <p className="mt-2 ml-7">{error}</p>
    </div>
  );
};

export default ErrorDisplay;
