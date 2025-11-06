import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlogReports from '../BlogReports.page';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

/**
 * Workspace Blog Reports Page (Admin only)
 * 100% reuse of BlogReports component với workspace context
 */
const WorkspaceBlogReportsPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { t } = useAppTranslate('blog');

  // Override navigation to stay within workspace
  const handleBackToHome = () => {
    navigate(`/workspace/${workspaceId}/blog`);
  };

  return (
    <div>
      {/* Add workspace breadcrumb/header if needed */}
      <BlogReports />
    </div>
  );
};

export default WorkspaceBlogReportsPage;
