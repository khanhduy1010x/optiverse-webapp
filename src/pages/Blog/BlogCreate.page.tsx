import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogEditor } from '../../components/blog';
import { useBlog } from '../../hooks/blog';
import { BlogFormData } from '../../types/blog/blog.types';

const BlogCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    createPost,
    uploadImage,
    error: blogError
  } = useBlog();



  const handleSave = async (formData: BlogFormData) => {
    setIsSubmitting(true);
    try {
      const newPost = await createPost(formData);
      
      // Add a small delay to ensure the post is fully saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to the new post or back to blog list based on status
      if (formData.status === 'published') {
        navigate('/blog');
      } else {
        navigate(`/blog/post/${newPost.id}`);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      // Error is handled by the hook and displayed in the editor
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy? Tất cả thay đổi sẽ bị mất.')) {
      navigate('/blog');
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
                  <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                    Tạo bài viết mới
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tạo bài viết mới
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng
              </p>
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
          onSave={handleSave}
          onCancel={handleCancel}
          onImageUpload={handleImageUpload}
          isLoading={isSubmitting}
        />

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-4">
            💡 Mẹo viết bài hiệu quả
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <div>
              <h4 className="font-medium mb-2">Tiêu đề:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Sử dụng tiêu đề hấp dẫn và mô tả chính xác nội dung</li>
                <li>Độ dài lý tưởng: 50-60 ký tự</li>
                <li>Tránh sử dụng từ ngữ clickbait</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Nội dung:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Sử dụng Markdown để định dạng văn bản</li>
                <li>Chia nhỏ nội dung thành các đoạn ngắn</li>
                <li>Sử dụng hình ảnh để minh họa</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">SEO:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Viết meta description hấp dẫn (150-160 ký tự)</li>
                <li>Sử dụng từ khóa phù hợp trong tiêu đề và nội dung</li>
                <li>Chọn danh mục và tags phù hợp</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tương tác:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Kết thúc bài viết bằng câu hỏi để khuyến khích bình luận</li>
                <li>Trả lời bình luận của độc giả</li>
                <li>Chia sẻ bài viết trên mạng xã hội</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCreatePage;