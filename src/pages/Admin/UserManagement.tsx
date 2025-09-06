import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const UserManagement: React.FC = () => {
  const { t } = useAppTranslate('admin');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('user_management')}</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <p>{t('user_management_screen')}</p>
      </div>
    </div>
  );
};

export default UserManagement;
