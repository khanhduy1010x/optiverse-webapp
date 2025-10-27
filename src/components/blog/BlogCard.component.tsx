import React from 'react';
import { BlogPostWithAuthor } from '../../types/blog';
import { format } from 'date-fns';

interface BlogCardProps {
  post: BlogPostWithAuthor;
  onPostClick: (postId: string) => void;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onTagClick?: (tag: string) => void;
  onReport?: (postId: string, postTitle: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

/**
 * Modern Blog Card Component
 * Inspired by professional blog layouts
 */
const BlogCard: React.FC<BlogCardProps> = ({
  post,
  onPostClick,
  onLike,
  onBookmark,
  onTagClick,
  onReport,
  currentUserId,
  isAdmin
}) => {
  // Get featured image - use first image from images array or extract from content
  const getPostImage = (): string => {
    // Priority 1: Use first image from images array
    if (post.images && post.images.length > 0) return post.images[0];
    
    // Priority 2: Extract first image from HTML content
    const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
    
    // Priority 3: Use placeholder based on post title
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(post.title)}&size=400&background=gradient`;
  };

  // Get excerpt
  const getExcerpt = () => {
    if (post.excerpt) return post.excerpt;
    
    // Extract text from HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.slice(0, 150) + (text.length > 150 ? '...' : '');
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM dd, yyyy');
  };

  // Calculate read time
  const calculateReadTime = () => {
    const wordsPerMinute = 200;
    const words = post.content.split(' ').length;
    const readTime = Math.ceil(words / wordsPerMinute);
    return `${readTime} min read`;
  };

  return (
    <article 
      onClick={() => onPostClick(post.id)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-cyan-200"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50">
        <img
          src={getPostImage()}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.title)}&size=400&background=gradient`;
          }}
        />
        
        {/* Category Badge - Only show if has tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-semibold text-white bg-cyan-600/90 backdrop-blur-sm rounded-full">
              {post.tags[0]}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {getExcerpt()}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <button
                key={index}
                className="px-2 py-1 text-xs text-cyan-700 bg-cyan-50 rounded-md hover:bg-cyan-100 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTagClick) {
                    onTagClick(tag);
                  }
                }}
              >
                #{tag}
              </button>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-md">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.displayName || 'Author'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold shadow-sm">
                {post.author?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {post.author?.displayName || 'Unknown Author'}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <span>{calculateReadTime()}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {/* Views */}
            <div className="flex items-center gap-1" title="Views">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{post.viewCount || 0}</span>
            </div>

            {/* Likes - Interactive */}
            <button
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
              title={post.isLiked ? 'Unlike' : 'Like'}
              onClick={(e) => {
                e.stopPropagation();
                if (onLike) {
                  onLike(post.id);
                }
              }}
            >
              <svg 
                className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                fill={post.isLiked ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className={post.isLiked ? 'text-red-500 font-medium' : ''}>
                {post.likeCount || 0}
              </span>
            </button>

            {/* Comments */}
            <div className="flex items-center gap-1" title="Comments">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.commentCount || 0}</span>
            </div>

            {/* Bookmark - Interactive */}
            {onBookmark && (
              <button
                className={`flex items-center gap-1 hover:text-cyan-600 transition-colors ${post.isBookmarked ? 'text-cyan-600' : ''}`}
                title={post.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(post.id);
                }}
              >
                <svg 
                  className="w-4 h-4" 
                  fill={post.isBookmarked ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}

            {/* Report - Interactive (Admin or owner only) */}
            {onReport && (currentUserId !== post.authorId || isAdmin) && (
              <button
                className="flex items-center gap-1 hover:text-orange-600 transition-colors"
                title="Report post"
                onClick={(e) => {
                  e.stopPropagation();
                  onReport(post.id, post.title);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
