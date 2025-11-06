import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlogEditor } from '../../components/blog';
import { useBlog } from '../../hooks/blog';
import { BlogFormData, BlogPost } from '../../types/blog/blog.types';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const BlogEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useAppTranslate('blog');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    updatePost,
    getPostById,
    uploadImage,
    error: blogError
  } = useBlog();



  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/blog');
        return;
      }

      try {
        setIsLoading(true);
        const postData = await getPostById(id);
        
        if (!postData) {
          navigate('/blog');
          return;
        }

        setPost(postData);
      } catch (error) {
        console.error('Failed to load post:', error);
        navigate('/blog');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSave = async (formData: BlogFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const updatedPost = await updatePost(id, formData);
      
      // Navigate to the updated post
      navigate(`/blog/post/${updatedPost.id}`);
    } catch (error) {
      console.error('Failed to update post:', error);
      // Error is handled by the hook and displayed in the editor
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy? Tất cả thay đổi sẽ bị mất.')) {
      navigate(`/blog/post/${id}`);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      return await uploadImage(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error('Không thể tải lên hình ảnh. Vui lòng thử lại.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="space-y-6">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Không tìm thấy bài viết
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Quay lại Blog
          </button>
        </div>
      </div>
    );
  }

  // Convert post data to form data
  const initialData: BlogFormData = {
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    images: post.images,
    tags: post.tags,
    status: post.status,
    publishedAt: post.publishedAt
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={() => navigate('/blog')}
                  className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Blog
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <button
                    onClick={() => navigate(`/blog/post/${post.id}`)}
                    className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 md:ml-2 truncate max-w-xs"
                  >
                    {post.title}
                  </button>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                    Chỉnh sửa
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Chỉnh sửa bài viết
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Cập nhật nội dung và thông tin bài viết của bạn
              </p>
            </div>
            
            {/* Post Status Badge */}
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                post.status === 'published' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : post.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {post.status === 'published' ? 'Đã xuất bản' : 
                 post.status === 'draft' ? 'Bản nháp' : 'Đã lưu trữ'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {blogError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Có lỗi xảy ra
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {blogError}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Editor */}
        <BlogEditor
          initialData={initialData}
          onSave={handleSave}
          onCancel={handleCancel}
          onImageUpload={handleImageUpload}
          isLoading={isSubmitting}
          isEditing={true}
        />

        {/* Post Statistics */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            📊 Thống kê bài viết
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {post.stats?.views || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lượt xem</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {post.stats?.likes || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lượt thích</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {post.stats?.comments || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bình luận</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {post.stats?.bookmarks || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lưu trữ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditPage;