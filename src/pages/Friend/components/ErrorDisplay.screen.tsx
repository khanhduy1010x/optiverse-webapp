import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorDisplayProps } from '../../../types/friend/props/component.props';
import { GROUP_CLASSNAMES } from '../../../styles';


const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, loading }) => {
  const { t } = useTranslation();

  return (
    <>
      {error && (
        <div className={GROUP_CLASSNAMES.errorAlert}>
          <div className={GROUP_CLASSNAMES.flexItemsCenter}>
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className={GROUP_CLASSNAMES.loadingAlert}>
          <div className={GROUP_CLASSNAMES.flexItemsCenter}>
            <div className="flex-shrink-0">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{t('Loading data, please wait...')}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorDisplay; 