import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const AdminDashboard: React.FC = () => {
  const { t } = useAppTranslate('admin');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('system_management')}</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <p>{t('admin_dashboard_screen')}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
