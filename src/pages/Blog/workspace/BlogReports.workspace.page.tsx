import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlogReports from '../BlogReports.page';

/**
 * Workspace Blog Reports Page (Admin only)
 * 100% reuse of BlogReports component với workspace context
 */
const WorkspaceBlogReportsPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

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
