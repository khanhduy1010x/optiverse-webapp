import React, { useState } from 'react';
import { BlogCommentSectionProps } from '../../types/blog/props/component.props';
import CommentItem from './CommentItem.component';

const CommentSection: React.FC<BlogCommentSectionProps> = ({
  postId,
  comments,
  postAuthorId,
  loading = false,
  hasMore = false,
  onLoadMore,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  className = ''
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wrapper function để đảm bảo đúng thứ tự tham số cho onReply
  const handleReply = async (parentId: string, content: string) => {
    if (onAddComment) {
      await onAddComment(content, parentId);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const topLevelComments = comments.filter(comment => !comment.parentId);

  // Hàm đệ quy để lấy tất cả replies của một comment
  const getNestedReplies = (parentId: string): BlogCommentWithAuthor[] => {
    return comments.filter(comment => comment.parentId === parentId);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Bình luận ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <div>
          <label htmlFor="comment" className="sr-only">
            Thêm bình luận
          </label>
          <textarea
            id="comment"
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Đang gửi...
              </>
            ) : (
              'Gửi bình luận'
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="text-lg font-medium mb-2">Chưa có bình luận nào</h3>
            <p className="text-sm">Hãy là người đầu tiên bình luận về bài viết này!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {topLevelComments.map((comment, index) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postAuthorId={postAuthorId}
              replies={getNestedReplies(comment.id)}
              onReply={handleReply}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
              onLike={onLikeComment}
              level={0}
              allComments={comments}
              isLastInLevel={index === topLevelComments.length - 1}
            />
          ))}
        </div>
      )}

      {/* Load More Comments */}
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
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
              'Tải thêm bình luận'
            )}
          </button>
        </div>
      )}

      {/* Loading indicator for additional comments */}
      {loading && comments.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center text-gray-500 dark:text-gray-400">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            Đang tải thêm bình luận...
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;