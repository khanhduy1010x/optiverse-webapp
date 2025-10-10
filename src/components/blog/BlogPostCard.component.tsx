import React, { useState } from 'react';
import { BlogPostCardProps } from '../../types/blog/props/component.props';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import ImageGrid from './ImageGrid.component';
import SimpleImageViewer from './SimpleImageViewer.component';

const BlogPostCard: React.FC<BlogPostCardProps> = ({
  post,
  onClick,
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
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  const handleDetailClick = () => {
    if (onClick) {
      onClick(post.id);
    }
  };



  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(post.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      onDelete(post.id);
    }
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReport) {
      onReport(post.id, post.title);
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

  const isAuthor = currentUserId === post.author?.userId;
  const canDelete = isAdmin || isAuthor;

  // Tạo preview content từ content hoặc excerpt
  const getContentPreview = () => {
    if (post.excerpt) {
      return post.excerpt;
    }
    
    // Nếu không có excerpt, tạo preview từ content
    if (post.content) {
      // Loại bỏ HTML tags và lấy 150 ký tự đầu
      const textContent = post.content.replace(/<[^>]*>/g, '');
      return textContent.length > 150 
        ? textContent.substring(0, 150) + '...'
        : textContent;
    }
    
    return 'Không có nội dung preview...';
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: vi });
    } catch (error) {
      return 'Không xác định';
    }
  };

  return (
    <>
      <article className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transform hover:-translate-y-1 ${className}`}>
      <div className="p-7">
        {/* 1. Author Info */}
        {showAuthor && (
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-4">
              {post.author?.avatar ? (
                <img 
                  src={post.author.avatar} 
                  alt={post.author.displayName || post.author.name || 'Unknown Author'}
                  className="w-12 h-12 rounded-full object-cover ring-3 ring-blue-100 dark:ring-blue-900 shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-3 ring-blue-100 dark:ring-blue-900 shadow-lg">
                  <span className="text-lg font-bold text-white">
                    {post.author?.displayName?.charAt(0) || post.author?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {post.author?.displayName || post.author?.name || 'Unknown Author'}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Tác giả
                </p>
              </div>
            </div>
            
            {/* Time badge and View count */}
            <div className="flex items-center space-x-3">
              <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20">
                <svg className="w-3 h-3 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(post.createdAt)}
              </div>
              {isAuthor && (
                <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                  <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{post.viewCount || 0}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Images - Moved below author */}
        {post.images && post.images.length > 0 && (
          <div className="mb-5">
            {console.log('BlogPostCard - post.images:', post.images)}
            <ImageGrid 
              images={post.images} 
              alt={post.title}
              maxDisplay={4}
              onClick={handleImageClick}
            />
          </div>
        )}

        {/* 3. Category */}
        {showCategory && post.category && (
          <div className="mb-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {post.category.name}
            </span>
          </div>
        )}

        {/* 4. Title */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-4">
          {post.title}
        </h3>

        {/* 5. Content Preview */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 text-base">
            {getContentPreview()}
          </p>
        </div>

        {/* 6. Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 pb-5 border-b border-gray-100 dark:border-gray-700">
            {post.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                {tag}
              </button>
            ))}
            {post.tags.length > 4 && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400">
                +{post.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* 7. Stats & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Enhanced Like button */}
            <button 
              onClick={handleLikeClick}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                post.isLiked 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-200 dark:shadow-red-900/50' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white'
              }`}
            >
              <svg 
                className={`w-5 h-5 ${post.isLiked ? 'fill-current' : 'fill-none'}`} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-bold">{post.likeCount || 0}</span>
            </button>

            {/* Enhanced Comment indicator */}
            <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-bold">{post.commentCount || 0}</span>
            </div>
          </div>

          {/* Enhanced Actions */}
          <div className="flex items-center space-x-3">
            {/* Report button - chỉ hiện khi không phải tác giả và không phải admin */}
            {showActions && !isAuthor && !isAdmin && onReport && (
              <button
                onClick={handleReportClick}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                title="Tố cáo bài viết"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Tố cáo
              </button>
            )}

            {/* Delete button */}
            {showActions && canDelete && onDelete && (
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                title={isAdmin ? "Xóa bài viết (Admin)" : "Xóa bài viết của bạn"}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa
              </button>
            )}
            
            {/* Enhanced Detail button */}
            <button
              onClick={handleDetailClick}
              className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#21B4CA] hover:bg-[#1a9bb0] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#21B4CA]/30"
            >
              <span>Xem chi tiết</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
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

export default BlogPostCard;