import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogList } from '../../components/blog';
import { useLikes } from '../../hooks/blog';
import { useAuthState } from "../../hooks/useAuthState.hook";
import { BlogPostWithAuthor } from '../../types/blog/blog.types';

const BlogBookmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BlogPostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthState();
  const { fetchBookmarkedPostsWithDetails, togglePostLike } = useLikes();

  useEffect(() => {
    loadBookmarkedPosts();
  }, []);

  const loadBookmarkedPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const posts = await fetchBookmarkedPostsWithDetails();
      setBookmarkedPosts(posts);
    } catch (err) {
      console.error('Error loading bookmarked posts:', err);
      setError('Không thể tải danh sách bài đã lưu');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = (postId: string) => {
    navigate(`/blog/post/${postId}`);
  };

  const handleLike = async (postId: string) => {
    try {
      await togglePostLike(postId);
      // Refresh bookmarked posts để cập nhật like status
      await loadBookmarkedPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/blog?search=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/blog')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                </svg>
                Blog
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">Bài đã lưu</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Bài đã lưu
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Danh sách các bài viết bạn đã bookmark
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/blog')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105"
              >
                <svg className="h-4 w-4 mr-2 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại Blog
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="lg:col-span-1">
            {error ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Có lỗi xảy ra
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {error}
                  </p>
                  <button
                    onClick={loadBookmarkedPosts}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            ) : bookmarkedPosts.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Chưa có bài viết nào được lưu
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Hãy bookmark những bài viết yêu thích để xem lại sau
                  </p>
                  <button
                    onClick={() => navigate('/blog')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Khám phá bài viết
                  </button>
                </div>
              </div>
            ) : (
              <BlogList
                posts={bookmarkedPosts}
                loading={isLoading}
                onPostClick={handlePostClick}
                onLike={handleLike}
                currentUserId={user?.userId}
                onTagClick={handleTagClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogBookmarksPage;