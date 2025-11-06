import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlogEditor } from '../../../components/blog';
import { CreateBlogPostRequest } from '../../../types/blog';
import blogService from '../../../services/blog/blog.service';
import { BlogService } from '../../../services/blog';
import { useAuthState } from '../../../hooks/useAuthState.hook';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

/**
 * Workspace Blog Create Page
 * Reuse 100% BlogEditor component
 * Chỉ khác: auto-add workspaceId
 */
const WorkspaceBlogCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user } = useAuthState();
  const { t } = useAppTranslate('blog');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (postData: any) => {
    if (!workspaceId || !user) {
      setError('Missing workspace or user information');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Convert to CreateBlogPostRequest format
      const requestData: CreateBlogPostRequest = {
        title: postData.title || '',
        content: postData.content || '',
        excerpt: postData.excerpt,
        tags: postData.tags || [],
        images: postData.images || [],
        isPublic: postData.status === 'published',
        isDraft: postData.status === 'draft',
        metaTitle: postData.metaTitle
      };

      // Create workspace blog post
      const newPost = await blogService.createWorkspaceBlogPost(workspaceId, requestData);

      console.log('✅ Workspace blog post created:', newPost.id);

      // Navigate back to workspace blog
      navigate(`/workspace/${workspaceId}/blog`);
    } catch (err: any) {
      console.error('❌ Error creating workspace blog post:', err);
      setError(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/workspace/${workspaceId}/blog`);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      console.log('📤 Uploading image:', file.name);
      const imageUrl = await BlogService.uploadImage(file);
      console.log('✅ Image uploaded:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-cyan-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              ✍️ Create Workspace Blog Post
            </h1>
            
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← {t('back_to_blog')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Reuse BlogEditor 100% */}
        <BlogEditor
          onSave={handleSubmit}
          onCancel={handleCancel}
          onImageUpload={handleImageUpload}
          loading={isSubmitting}
        />
      </div>
    </div>
  );
};

export default WorkspaceBlogCreatePage;
