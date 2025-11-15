import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogCard from '../../components/blog/BlogCard.component';
import ReportModal from '../../components/blog/ReportModal.component';
import { useLikes, useReports } from '../../hooks/blog';
import { useAuthState } from "../../hooks/useAuthState.hook";
import { useAuthStatus } from '../../hooks/auth/useAuthStatus.hook';
import { BlogPostWithAuthor } from '../../types/blog/blog.types';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const BlogBookmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAppTranslate('blog');
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BlogPostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string>('');
  const [reportPostTitle, setReportPostTitle] = useState<string>('');

  // Bookmark state (using localStorage for now)
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());

  const { user } = useAuthState();
  const { isAdmin } = useAuthStatus();
  const { fetchBookmarkedPostsWithDetails, togglePostLike } = useLikes();
  const { createReport } = useReports();

  useEffect(() => {
    loadBookmarkedPosts();
    
    // Load bookmark IDs from localStorage
    if (user?.user_id) {
      const saved = localStorage.getItem(`bookmarks_${user.user_id}`);
      if (saved) {
        try {
          const bookmarks = JSON.parse(saved);
          setBookmarkedPostIds(new Set(bookmarks));
        } catch (error) {
          console.error('Error loading bookmark IDs:', error);
        }
      }
    }
  }, [user?.user_id]);

  const loadBookmarkedPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const posts = await fetchBookmarkedPostsWithDetails();
      setBookmarkedPosts(posts);
    } catch (err) {
      console.error('Error loading bookmarked posts:', err);
      setError(t('error_loading_saved_posts'));
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

  const handleBookmarkPost = (postId: string) => {
    if (!user) {
      alert(t('please_login_to_bookmark'));
      return;
    }

    try {
      const newBookmarks = new Set(bookmarkedPostIds);
      if (newBookmarks.has(postId)) {
        newBookmarks.delete(postId);
        // Remove from displayed list
        setBookmarkedPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        newBookmarks.add(postId);
      }
      
      setBookmarkedPostIds(newBookmarks);
      localStorage.setItem(`bookmarks_${user.user_id}`, JSON.stringify(Array.from(newBookmarks)));
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/blog?search=${encodeURIComponent(tag)}`);
  };

  const handleReportPost = (postId: string, postTitle: string) => {
    setReportPostId(postId);
    setReportPostTitle(postTitle);
    setReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-cyan-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => navigate('/blog')}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="Back to Blog"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  {t('savedPostsTitle')}
                </h1>
              </div>
              <p className="text-sm text-gray-600 ml-7">
                {t('savedPostsDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="mb-6">
          <p className="text-gray-600">
            {bookmarkedPosts.length > 0 ? (
              <>
                {t('showing_saved_articles')} <span className="font-semibold text-gray-900">{bookmarkedPosts.length}</span> {bookmarkedPosts.length !== 1 ? t('saved_articles') : t('saved_article')}
              </>
            ) : (
              t('no_saved_articles')
            )}
          </p>
        </div>

        {/* Content */}
        <div>
          {error ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('error_occurred')}
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <button
                onClick={loadBookmarkedPosts}
                className="px-8 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #21b4ca 0%, #1e90ff 100%)',
                }}
              >
                {t('retry')}
              </button>
            </div>
          ) : bookmarkedPosts.length === 0 && !isLoading ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('no_saved_posts_yet')}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('bookmark_favorite_posts')}
              </p>
              <button
                onClick={() => navigate('/blog')}
                className="px-8 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #21b4ca 0%, #1e90ff 100%)',
                }}
              >
                {t('explore_posts')}
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedPosts.map((post) => {
                const postWithBookmark = {
                  ...post,
                  isBookmarked: bookmarkedPostIds.has(post.id)
                };
                
                return (
                  <BlogCard
                    key={post.id}
                    post={postWithBookmark}
                    onPostClick={handlePostClick}
                    onLike={handleLike}
                    onBookmark={handleBookmarkPost}
                    onTagClick={handleTagClick}
                    onReport={handleReportPost}
                    currentUserId={user?.user_id}
                    isAdmin={isAdmin}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        postId={reportPostId}
        postTitle={reportPostTitle}
        onClose={() => setReportModalOpen(false)}
        onReportSuccess={() => {
          setReportModalOpen(false);
          alert(t('report_submitted_success'));
        }}
      />
    </div>
  );
};

export default BlogBookmarksPage;