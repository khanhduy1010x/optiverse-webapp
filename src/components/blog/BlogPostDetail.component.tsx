import React, { useState, useEffect } from 'react';
import { BlogPostDetailProps } from '../../types/blog/props/component.props';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import ImageGrid from './ImageGrid.component';
import SimpleImageViewer from './SimpleImageViewer.component';

const BlogPostDetail: React.FC<BlogPostDetailProps> = ({
  post,
  onLike,
  onBookmark,
  onShare,
  onReport,
  onDelete,
  onTagClick,
  isAdmin = false,
  currentUserId,
  workspaceCreatorId,
  className = ''
}) => {
  // Debug: Log post data
  console.log('BlogPostDetail - Post data:', post);
  console.log('BlogPostDetail - Post content:', post.content);
  console.log('BlogPostDetail - Current User ID:', currentUserId);
  console.log('BlogPostDetail - Author User ID:', post.author?.userId);
  console.log('BlogPostDetail - Is Admin:', isAdmin);
  console.log('BlogPostDetail - Can Delete:', isAdmin || currentUserId === post.author?.userId);
  
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');


  // Đồng bộ state với props khi post thay đổi
  useEffect(() => {
    setIsLiked(post.isLiked || false);
    setIsBookmarked(post.isBookmarked || false);
    setLikeCount(post.likeCount);
  }, [post.isLiked, post.isBookmarked, post.likeCount]);

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'dd MMMM yyyy', { locale: vi });
  };

  const formatRelativeDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi
    });
  };



  const handleDelete = () => {
    if (onDelete && window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      onDelete(post.id);
    }
  };



  const handleLike = () => {
    if (onLike) {
      onLike(post.id);
      // State sẽ được cập nhật thông qua useEffect khi props thay đổi
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(post.id);
      // State sẽ được cập nhật thông qua useEffect khi props thay đổi
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post);
    } else {
      // Default share functionality
      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        // You might want to show a toast notification here
      }
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
    setSelectedImageUrl('');
  };

  return (
    <>
      <article className={`bg-white rounded-2xl shadow-sm p-8 ${className}`}>
      {/* Header */}
      <header className="mb-8">


        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>



        {/* Author and Meta Info */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <div className="flex items-center space-x-4">
            {post.author && (
              <>
                <div className="flex-shrink-0">
                  {post.author.avatar ? (
                    <img
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                      src={post.author.avatar}
                      alt={post.author.displayName}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-sm">
                      <span className="text-lg font-semibold text-white">
                        {post.author.displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="text-lg font-medium text-gray-900">
                      {post.author.displayName || 'Unknown User'}
                    </p>
                    {post.author.isVerified && (
                      <svg
                        className="ml-1 h-5 w-5 text-cyan-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 space-x-2">
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    <span>•</span>
                    <span>{formatRelativeDate(post.publishedAt || post.createdAt)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                isLiked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg
                className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`}
                fill={isLiked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {likeCount}
            </button>

            <button
              onClick={handleBookmark}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                isBookmarked
                  ? 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg
                className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
                fill={isBookmarked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 hover:scale-105"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </button>

            {onReport && !isAdmin && currentUserId !== post.author?.userId && (
              <button
                onClick={() => onReport(post.id, post.title)}
                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 hover:scale-105"
                title="Tố cáo bài viết"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1 1H5a2 2 0 01-2-2zm9-13.5V9"
                  />
                </svg>
              </button>
            )}

            {/* Delete button - hiển thị cho admin, tác giả, hoặc workspace creator */}
            {onDelete && (isAdmin || currentUserId === post.author?.userId || (workspaceCreatorId && currentUserId === workspaceCreatorId)) && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                title={
                  isAdmin 
                    ? "Xóa bài viết (Admin)" 
                    : workspaceCreatorId && currentUserId === workspaceCreatorId
                    ? "Xóa bài viết (Workspace Creator)"
                    : "Xóa bài viết của bạn"
                }
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Xóa
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-8">
          <ImageGrid 
            images={post.images} 
            alt={post.title}
            className="max-w-full"
            onClick={handleImageClick}
          />
        </div>
      )}

      {/* Content */}
      <div className="w-full mb-8">
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="border-t border-gray-200 pt-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors duration-200 cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5">
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="font-medium text-gray-900">{post.viewCount} lượt xem</span>
            </div>
            
            <div className="flex items-center space-x-1.5">
              <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium text-gray-900">{post.commentCount} bình luận</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="font-medium text-gray-900">{post.bookmarkCount} lưu</span>
            </div>
          </div>

          {post.updatedAt !== post.createdAt && (
            <div>
              <span className="font-medium text-gray-700">Cập nhật lần cuối: {formatRelativeDate(post.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>


      </article>
      
      {/* Simple Image Viewer */}
      <SimpleImageViewer
        imageUrl={selectedImageUrl}
        isOpen={isImageViewerOpen}
        onClose={handleCloseImageViewer}
      />
    </>
  );
};

export default BlogPostDetail;