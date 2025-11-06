import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkspaceBlogPostDetail from '../../../components/blog/workspace/WorkspaceBlogPostDetail.component';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

/**
 * Workspace Blog Post Detail Page
 * Reuse 100% BlogPostDetail component qua WorkspaceBlogPostDetail wrapper
 * Giống như cách BlogCreate.workspace.page.tsx wrap BlogEditor
 */
const WorkspaceBlogPostPage: React.FC = () => {
  const { workspaceId, postId } = useParams<{ workspaceId: string; postId: string }>();
  const navigate = useNavigate();
  const { t } = useAppTranslate('blog');

  const handleBack = () => {
    navigate(`/workspace/${workspaceId}/blog`);
  };

  const handleEdit = () => {
    navigate(`/workspace/${workspaceId}/blog/edit/${postId}`);
  };

  if (!workspaceId || !postId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>Invalid workspace or post ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-cyan-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('back_to_workspace_blog')}
          </button>
        </div>
      </div>

      {/* Content - Reuse BlogPostDetail 100% qua WorkspaceBlogPostDetail wrapper */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <WorkspaceBlogPostDetail
          workspaceId={workspaceId}
          postId={postId}
          onBack={handleBack}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};

export default WorkspaceBlogPostPage;
