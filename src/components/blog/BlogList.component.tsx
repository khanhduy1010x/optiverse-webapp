import React from 'react';
import { BlogListProps } from '../../types/blog/props/component.props';
import BlogPostCard from './BlogPostCard.component';

const BlogList: React.FC<BlogListProps> = ({
  posts,
  loading = false,
  hasMore = false,
  onLoadMore,
  onPostClick,
  onLike,
  onComment,
  onDelete,
  onReport,
  onTagClick,
  currentUserId,
  isAdmin = false,
  showAuthor = true,
  showCategory = true,
  showExcerpt = true,
  showActions = true,
  className = ''
}) => {
  if (loading && posts.length === 0) {
    return (
      <div className={`space-y-6 blog-list-scrollbar ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">Không có bài viết nào</h3>
          <p className="text-sm">Hãy tạo bài viết đầu tiên của bạn!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 blog-list-scrollbar ${className}`}>
      {posts.map((post) => (
        <BlogPostCard
          key={post.id}
          post={post}
          onClick={onPostClick}
          onLike={onLike}
          onComment={onComment}
          onDelete={onDelete}
          onReport={onReport}
          onTagClick={onTagClick}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          showAuthor={showAuthor}
          showCategory={showCategory}
          showExcerpt={showExcerpt}
          showActions={showActions}
        />
      ))}
      
      {hasMore && (
        <div className="text-center py-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#21B4CA] hover:bg-[#1a9bb0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#21B4CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang tải...
              </>
            ) : (
              'Tải thêm'
            )}
          </button>
        </div>
      )}
      
      {loading && posts.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center text-gray-500 dark:text-gray-400">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Đang tải thêm bài viết...
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;