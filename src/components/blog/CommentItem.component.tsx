import React, { useState, useEffect } from 'react';
import { BlogCommentItemProps } from '../../types/blog/props/component.props';
import { BlogCommentWithAuthor } from '../../types/blog/blog.types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CommentItemExtendedProps extends BlogCommentItemProps {
  replies?: BlogCommentWithAuthor[];
  allComments?: BlogCommentWithAuthor[];
  isLastInLevel?: boolean;
}

const CommentItem: React.FC<CommentItemExtendedProps> = ({
  comment,
  postAuthorId,
  replies = [],
  allComments = [],
  onReply,
  onEdit,
  onDelete,
  onLike,
  level = 0,
  className = '',
  isLastInLevel = false
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReplies, setShowReplies] = useState(level === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Đồng bộ state local với props khi comment data thay đổi
  useEffect(() => {
    setIsLiked(comment.isLiked || false);
    setLikeCount(comment.likeCount);
  }, [comment.isLiked, comment.likeCount]);

  const maxNestingLevel = 5;
  const canNest = level < maxNestingLevel;

  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi
    });
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !onReply) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
      setShowReplies(true);
    } catch (error) {
      console.error('Failed to reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim() || !onEdit) return;

    setIsSubmitting(true);
    try {
      await onEdit(comment.id, editText.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = () => {
    if (onLike) {
      onLike(comment.id);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      onDelete(comment.id);
    }
  };

  return (
    <div className={`${className}`}>
      {/* Root level comment */}
      {level === 0 && (
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${comment.author?.userId === postAuthorId ? '' : 'border border-gray-200 dark:border-gray-700'}`}>
          <div className="flex space-x-3">
            {/* Simple Avatar */}
            <div className="flex-shrink-0">
              {comment.author?.avatar ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={comment.author.avatar}
                  alt={comment.author.displayName || 'User'}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {comment.author?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* Comment Content */}
            <div className="flex-1 min-w-0">
              {/* Author and Date */}
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.author?.displayName || 'Unknown User'}
                </p>
                {comment.author?.userId === postAuthorId && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Tác giả
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">(đã sửa)</span>
                )}
              </div>

              {/* Comment Text */}
              {isEditing ? (
                <form onSubmit={handleEdit} className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    rows={3}
                    disabled={isSubmitting}
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={!editText.trim() || isSubmitting}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditText(comment.content);
                      }}
                      className="px-3 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap mb-3">
                  {comment.content}
                </div>
              )}

              {/* Simple Actions */}
              {!isEditing && (
                <div className="flex items-center space-x-4 text-xs">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 hover:text-red-600 ${
                      isLiked ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <svg className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{likeCount > 0 ? likeCount : 'Thích'}</span>
                  </button>

                  {canNest && (
                    <button
                      onClick={() => setIsReplying(!isReplying)}
                      className="text-gray-500 dark:text-gray-400 hover:text-blue-600"
                    >
                      Trả lời
                    </button>
                  )}

                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={handleDelete}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600"
                  >
                    Xóa
                  </button>
                </div>
              )}

              {/* Simple Reply Form */}
              {isReplying && (
                <form onSubmit={handleReply} className="mt-3 space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Viết phản hồi..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    rows={3}
                    disabled={isSubmitting}
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={!replyText.trim() || isSubmitting}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReplying(false);
                        setReplyText('');
                      }}
                      className="px-3 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}

              {/* Simple Replies Section */}
              {replies.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowReplies(!showReplies)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-3"
                  >
                    {showReplies ? 'Ẩn' : 'Hiện'} {replies.length} phản hồi
                  </button>
                  
                  {showReplies && (
                    <div className="space-y-3">
                      {replies.map((reply) => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          postAuthorId={postAuthorId}
                          replies={allComments.filter(c => c.parentId === reply.id)}
                          allComments={allComments}
                          onReply={onReply}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onLike={onLike}
                          level={level + 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nested comments with improved thread line */}
      {level > 0 && (
        <div className="relative">
          {/* Vertical line extending from parent */}
          {!isLastInLevel && (
            <div className="absolute left-0 top-0 w-0.5 h-full bg-gray-300 dark:bg-gray-600"></div>
          )}
          
          {/* Horizontal connector line */}
          <div className="absolute left-0 top-6 w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
          
          {/* Comment container with proper margin */}
          <div className="ml-8 pl-4 pt-2">
            <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-3 ${comment.author?.userId === postAuthorId ? '' : 'border border-gray-200 dark:border-gray-700'}`}>
              <div className="flex space-x-3">
                {/* Simple Avatar */}
                <div className="flex-shrink-0">
                  {comment.author?.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={comment.author.avatar}
                      alt={comment.author.displayName || 'User'}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {comment.author?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  {/* Author and Date */}
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.author?.displayName || 'Unknown User'}
                    </p>
                    {comment.author?.userId === postAuthorId && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Tác giả
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.isEdited && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">(đã sửa)</span>
                    )}
                  </div>

                  {/* Comment Text */}
                  {isEditing ? (
                    <form onSubmit={handleEdit} className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        rows={3}
                        disabled={isSubmitting}
                      />
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={!editText.trim() || isSubmitting}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setEditText(comment.content);
                          }}
                          className="px-3 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap mb-2">
                      {comment.content}
                    </div>
                  )}

                  {/* Simple Actions */}
                  {!isEditing && (
                    <div className="flex items-center space-x-4 text-xs">
                      <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1 hover:text-red-600 ${
                          isLiked ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <svg className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{likeCount > 0 ? likeCount : 'Thích'}</span>
                      </button>

                      {canNest && (
                        <button
                          onClick={() => setIsReplying(!isReplying)}
                          className="text-gray-500 dark:text-gray-400 hover:text-blue-600"
                        >
                          Trả lời
                        </button>
                      )}

                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={handleDelete}
                        className="text-gray-500 dark:text-gray-400 hover:text-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  )}

                  {/* Simple Reply Form */}
                  {isReplying && (
                    <form onSubmit={handleReply} className="mt-3 space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Viết phản hồi..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        rows={3}
                        disabled={isSubmitting}
                      />
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={!replyText.trim() || isSubmitting}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsReplying(false);
                            setReplyText('');
                          }}
                          className="px-3 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Simple Replies Section */}
                  {replies.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2"
                      >
                        {showReplies ? 'Ẩn' : 'Hiện'} {replies.length} phản hồi
                      </button>
                      
                      {showReplies && (
                        <div className="space-y-3">
                          {replies.map((reply, index) => (
                            <CommentItem
                              key={reply.id}
                              comment={reply}
                              postAuthorId={postAuthorId}
                              replies={allComments.filter(c => c.parentId === reply.id)}
                              allComments={allComments}
                              onReply={onReply}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onLike={onLike}
                              level={level + 1}
                              isLastInLevel={index === replies.length - 1}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentItem;