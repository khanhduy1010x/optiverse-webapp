import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const SystemSettings: React.FC = () => {
  const { t } = useAppTranslate('admin');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('system_settings')}</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <p>{t('system_settings_screen')}</p>
      </div>
    </div>
  );
};

export default SystemSettings;
