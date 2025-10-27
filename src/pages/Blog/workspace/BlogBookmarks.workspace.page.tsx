import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlogBookmarks from '../BlogBookmarks.page';

/**
 * Workspace Blog Bookmarks Page
 * 100% reuse of BlogBookmarks component với workspace context
 */
const WorkspaceBlogBookmarksPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  // Override navigation to stay within workspace
  const handleBackToHome = () => {
    navigate(`/workspace/${workspaceId}/blog`);
  };

  return (
    <div>
      {/* Add workspace breadcrumb/header if needed */}
      <BlogBookmarks />
    </div>
  );
};

export default WorkspaceBlogBookmarksPage;
