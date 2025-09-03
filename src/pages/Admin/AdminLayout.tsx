import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const AdminLayout: React.FC = () => {
  const { t } = useAppTranslate('admin');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.__adminScrollEl = scrollContainerRef.current;
  }, []);

  return (
    <div className="flex">
      <AdminSidebar />
      <div ref={scrollContainerRef} className="flex-1 ml-64 ">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
