import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BlogCard from '../../../components/blog/BlogCard.component';
import ReportModal from '../../../components/blog/ReportModal.component';
import { useWorkspaceBlog } from '../../../hooks/blog/useWorkspaceBlog';
import { useLikes, useReports } from '../../../hooks/blog';
import { useAuthState } from '../../../hooks/useAuthState.hook';
import { useAuthStatus } from '../../../hooks/auth/useAuthStatus.hook';
import { BlogSortBy, BlogSearchFilters, SearchType } from '../../../types/blog/blog.types';
import { BlogPostWithAuthor } from '../../../types/blog';
import workspaceService from '../../../services/workspace.service';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

/**
 * Workspace Blog Page
 * Modern card-based layout inspired by professional blogs
 */
const BlogWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { t } = useAppTranslate('blog');
  
  const [workspace, setWorkspace] = useState<any>(null);
  const [sortBy, setSortBy] = useState<BlogSortBy>(BlogSortBy.NEWEST);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [filteredPosts, setFilteredPosts] = useState<BlogPostWithAuthor[]>([]);
  
  // ✅ FIX: useRef để track đã load workspace chưa (tránh loop)
  const workspaceLoadedRef = useRef(false);
  
  // 🔍 DEBUG: Log component lifecycle
  useEffect(() => {
    console.log('🎬 BlogWorkspacePage MOUNTED');
    return () => {
      console.log('💀 BlogWorkspacePage UNMOUNTED');
    };
  }, []);
  
  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string>('');
  const [reportPostTitle, setReportPostTitle] = useState<string>('');

  // Hook để lấy workspace blog posts
  const {
    posts: workspacePosts,
    loading: postsLoading,
    error: postsError
  } = useWorkspaceBlog(workspaceId || null);

  const { user } = useAuthState();
  const { isAdmin } = useAuthStatus();
  const { togglePostLike } = useLikes();
  const { createReport } = useReports();

  // Ref cho scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Bookmark state (using localStorage for now)
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    if (user?.user_id) {
      const saved = localStorage.getItem(`bookmarks_${user.user_id}`);
      if (saved) {
        try {
          const bookmarks = JSON.parse(saved);
          setBookmarkedPosts(new Set(bookmarks));
        } catch (error) {
          console.error('Error loading bookmarks:', error);
        }
      }
    }
  }, [user?.user_id]);

  // ✅ Load workspace info CHỈ 1 LẦN khi mount
  useEffect(() => {
    const loadWorkspace = async () => {
      // ✅ FIX: CHỈ load nếu chưa có workspace VÀ chưa load
      if (!workspaceId || workspace !== null || workspaceLoadedRef.current) {
        console.log('⏭️ Skip loading workspace:', { hasWorkspace: workspace !== null, isLoaded: workspaceLoadedRef.current });
        return;
      }

      try {
        console.log('📂 Loading workspace info...');
        workspaceLoadedRef.current = true; // ✅ Set TRƯỚC khi load để tránh race condition
        const workspaceDetail = await workspaceService.getWorkspaceById(workspaceId);
        setWorkspace(workspaceDetail);
        console.log('✅ Workspace loaded:', workspaceDetail.name);
      } catch (error) {
        console.error('❌ Failed to load workspace:', error);
        workspaceLoadedRef.current = false; // Reset nếu lỗi
      }
    };

    loadWorkspace();
  }, [workspaceId]); // ✅ CHỈ phụ thuộc workspaceId, KHÔNG phụ thuộc workspace

  // Filter and sort posts
  useEffect(() => {
    let filtered = [...workspacePosts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => {
        if (searchType === 'title') {
          return post.title.toLowerCase().includes(query);
        } else if (searchType === 'tags') {
          return post.tags?.some(tag => tag.toLowerCase().includes(query));
        } else if (searchType === 'author') {
          return post.author?.displayName?.toLowerCase().includes(query) ||
                 post.author?.name?.toLowerCase().includes(query);
        } else {
          // 'all' - search in title, content, and tags
          return post.title.toLowerCase().includes(query) ||
                 post.content.toLowerCase().includes(query) ||
                 post.tags?.some(tag => tag.toLowerCase().includes(query));
        }
      });
    }

    // Sort
    switch (sortBy) {
      case BlogSortBy.NEWEST:
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case BlogSortBy.MOST_LIKED:
        filtered.sort((a, b) => b.likeCount - a.likeCount);
        break;
    }

    setFilteredPosts(filtered);
  }, [workspacePosts, searchQuery, searchType, sortBy]);

  // Function để scroll lên đầu
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handlePostClick = (postId: string) => {
    navigate(`/workspace/${workspaceId}/blog/post/${postId}`);
  };

  const handleCreatePost = () => {
    navigate(`/workspace/${workspaceId}/blog/create`);
  };

  const handleEditPost = (postId: string) => {
    navigate(`/workspace/${workspaceId}/blog/edit/${postId}`);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm(t('confirm_delete_post'))) {
      return;
    }

    try {
      const blogService = (await import('../../../services/blog/blog.service')).default;
      await blogService.deletePost(postId);
      alert(t('post_deleted_success'));
      // Posts will auto-refresh from useWorkspaceBlog hook
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(t('post_delete_failed'));
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      alert(t('please_login_to_like'));
      return;
    }

    try {
      await togglePostLike(postId);
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
      const newBookmarks = new Set(bookmarkedPosts);
      if (newBookmarks.has(postId)) {
        newBookmarks.delete(postId);
      } else {
        newBookmarks.add(postId);
      }
      
      setBookmarkedPosts(newBookmarks);
      localStorage.setItem(`bookmarks_${user.user_id}`, JSON.stringify(Array.from(newBookmarks)));
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setSearchType('tags');
    // Scroll to top to see results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportPost = (postId: string, postTitle: string) => {
    setReportPostId(postId);
    setReportPostTitle(postTitle);
    setReportModalOpen(true);
  };

  if (postsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p>{t('error_loading_blog')}: {postsError}</p>
          <button
            onClick={() => navigate(`/workspace/${workspaceId}/dashboard`)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('back_to_workspace_button')}
          </button>
        </div>
      </div>
    );
  }

  // ✅ FIX: Early return CHỈ khi chưa load workspace
  // KHÔNG check postsLoading vì blog có thể hiện UI empty state
  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">{t('loading_workspace')}</p>
        </div>
      </div>
    );
  }

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
                  onClick={() => navigate(`/workspace/${workspaceId}/dashboard`)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title={t('back_to_workspace')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  {workspace?.name || 'Workspace'} Blog
                </h1>
              </div>
              <p className="text-sm text-gray-600 ml-7">
                {t('latest_news_description')}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Bookmarks Button */}
              <button
                onClick={() => navigate(`/workspace/${workspaceId}/blog/bookmarks`)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                title={t('saved_posts')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {t('saved_posts')}
              </button>

              {/* Reports Button - Hidden in workspace */}
              {/* Workspace không dùng report, chỉ có delete cho creator */}

              {/* Create Post Button */}
              {user && (
                <button
                  onClick={handleCreatePost}
                  className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #21b4ca 0%, #1e90ff 100%)',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('create_post')}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-6 space-y-4">
            {/* Search Input + Filter */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('search_articles')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              {/* Search Type Filter - Next to search */}
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as SearchType)}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white/80 backdrop-blur-sm"
              >
                <option value="all">{t('all_fields')}</option>
                <option value="title">{t('title_only')}</option>
                <option value="tags">{t('tags')}</option>
                <option value="author">{t('author')}</option>
              </select>
            </div>

            {/* Tabs for sorting - Desktop */}
            <div className="hidden md:flex items-center gap-2 border-b border-gray-200">
              <button
                onClick={() => setSortBy(BlogSortBy.NEWEST)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  sortBy === BlogSortBy.NEWEST
                    ? 'text-cyan-600 border-b-2 border-cyan-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('newest')}
              </button>
              <button
                onClick={() => setSortBy(BlogSortBy.MOST_LIKED)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  sortBy === BlogSortBy.MOST_LIKED
                    ? 'text-cyan-600 border-b-2 border-cyan-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('most_liked')}
              </button>
            </div>

            {/* Mobile Dropdown */}
            <div className="md:hidden flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as BlogSortBy)}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white/80 backdrop-blur-sm"
              >
                <option value={BlogSortBy.NEWEST}>{t('newest')}</option>
                <option value={BlogSortBy.MOST_LIKED}>{t('most_liked')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="mb-6 flex items-center justify-between text-sm">
          <p className="text-gray-600">
            {filteredPosts.length > 0 ? (
              <>
                {t('showing_articles')} <span className="font-semibold text-gray-900">{filteredPosts.length}</span> {filteredPosts.length === 1 ? t('article') : t('articles')}
              </>
            ) : (
              t('no_articles_found')
            )}
          </p>
          
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="text-cyan-600 hover:text-cyan-700 font-medium"
            >
              {t('clear_search')}
            </button>
          )}
        </div>

        {/* Blog Cards Grid */}
        {postsLoading ? (
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
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={scrollContainerRef}>
            {filteredPosts.map((post) => {
              // Add bookmark status to post
              const postWithBookmark = {
                ...post,
                isBookmarked: bookmarkedPosts.has(post.id)
              };
              
              return (
                <BlogCard
                  key={post.id}
                  post={postWithBookmark}
                  onPostClick={handlePostClick}
                  onLike={handleLikePost}
                  onBookmark={handleBookmarkPost}
                  onTagClick={handleTagClick}
                  onDeletePost={handleDeletePost}
                  currentUserId={user?.user_id}
                  isAdmin={isAdmin}
                  isWorkspace={true}
                  workspaceCreatorId={workspace?.createdBy}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('no_articles_yet')}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery ? 
                t('no_search_results') :
                t('be_first_to_post')
              }
            </p>
            {user && !searchQuery && (
              <button
                onClick={handleCreatePost}
                className="px-8 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #21b4ca 0%, #1e90ff 100%)',
                }}
              >
                {t('create_first_post')}
              </button>
            )}
          </div>
        )}
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

// ✅ Memo để tránh unnecessary re-render từ parent (WorkspaceGuard)
export default React.memo(BlogWorkspacePage);
