import React from 'react';
import { WorkspaceGuard } from '../../../components/auth';
import BlogWorkspacePage from './Blog.workspace.page';

/**
 * Wrapper để tách WorkspaceGuard khỏi BlogWorkspacePage
 * Ngăn unmount khi WorkspaceGuard re-render
 */
const BlogWorkspaceWrapper: React.FC = () => {
  return (
    <WorkspaceGuard>
      <BlogWorkspacePage />
    </WorkspaceGuard>
  );
};

export default React.memo(BlogWorkspaceWrapper);
