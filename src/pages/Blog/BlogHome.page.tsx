import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BlogCard from '../../components/blog/BlogCard.component';
import ReportModal from '../../components/blog/ReportModal.component';
import { useBlog, useSearch, useLikes, useReports } from '../../hooks/blog';
import { useAuthState } from "../../hooks/useAuthState.hook";
import { useAuthStatus } from '../../hooks/auth/useAuthStatus.hook';
import { BlogSortBy, BlogSearchFilters, SearchType } from '../../types/blog/blog.types';
import { BlogPostWithAuthor } from '../../types/blog';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const BlogHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAppTranslate('blog');
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<BlogSortBy>(BlogSortBy.NEWEST);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [popularPosts, setPopularPosts] = useState<BlogPostWithAuthor[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPostWithAuthor[]>([]);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string>('');
  const [reportPostTitle, setReportPostTitle] = useState<string>('');

  const {
    posts,
    postsLoading,
    postsError,
    pagination,
    fetchPosts,
    fetchPopularPosts,
    loadMorePosts,
    deletePost
  } = useBlog();

  const {
    searchResults,
    searchLoading,
    searchPosts,
    clearSearch,
    popularTags,
  } = useSearch();

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

  // Function để scroll lên đầu
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Filter and sort posts
  useEffect(() => {
    let filtered = searchQuery ? [...searchResults] : [...posts];

    // Search filter (if not using searchResults from useSearch)
    if (searchQuery.trim() && searchResults.length === 0) {
      const query = searchQuery.toLowerCase();
      filtered = posts.filter(post => {
        const postWithAuthor = post as BlogPostWithAuthor;
        if (searchType === 'title') {
          return postWithAuthor.title.toLowerCase().includes(query);
        } else if (searchType === 'tags') {
          return postWithAuthor.tags?.some(tag => tag.toLowerCase().includes(query));
        } else if (searchType === 'author') {
          return postWithAuthor.author?.displayName?.toLowerCase().includes(query) ||
                 postWithAuthor.author?.name?.toLowerCase().includes(query);
        } else {
          // 'all' - search in title, content, and tags
          return postWithAuthor.title.toLowerCase().includes(query) ||
                 postWithAuthor.content.toLowerCase().includes(query) ||
                 postWithAuthor.tags?.some(tag => tag.toLowerCase().includes(query));
        }
      });
    }

    // Sort
    switch (sortBy) {
      case BlogSortBy.NEWEST:
        filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      case BlogSortBy.MOST_LIKED:
        filtered.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        break;
    }

    setFilteredPosts(filtered as BlogPostWithAuthor[]);
  }, [posts, searchResults, searchQuery, searchType, sortBy]);

  // Fetch popular posts khi component mount
  useEffect(() => {
    const loadPopularPosts = async () => {
      try {
        console.log('🔥 Fetching popular posts...');
        const popular = await fetchPopularPosts(5);
        console.log('✅ Popular posts loaded:', popular);
        setPopularPosts(popular);
      } catch (error) {
        console.error('❌ Error fetching popular posts:', error);
      }
    };

    loadPopularPosts();
  }, [fetchPopularPosts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchPosts({
        query: query.trim(),
        searchType: searchType
      });
    } else {
      clearSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    clearSearch();
  };

  const handlePostClick = (postId: string) => {
    navigate(`/blog/post/${postId}`);
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      alert('Please login to like posts');
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
      alert('Please login to bookmark posts');
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

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    try {
      await deletePost(postId);
      // Refresh the posts list
      fetchPosts({ sortBy });
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Có lỗi xảy ra khi xóa bài viết');
    }
  };

  if (postsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p>Error loading blog: {postsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Blog
              </h1>
              <p className="text-sm text-gray-600">
                The latest industry news, interviews, technologies, and resources
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Bookmarks Button */}
              <button
                onClick={() => navigate('/blog/bookmarks')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                title={t('saved_posts')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {t('saved_posts')}
              </button>

              {/* Reports Button (Admin only) */}
              {isAdmin && (
                <button
                  onClick={() => navigate('/blog/reports')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  title={t('view_reports')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {t('reports')}
                </button>
              )}

              {/* Create Post Button */}
              {user && (
                <button
                  onClick={() => navigate('/blog/create')}
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Blog Posts - Left Side (3 columns) */}
          <div className="lg:col-span-3">
            {/* Stats Bar */}
            <div className="mb-6 flex items-center justify-between text-sm">
              <p className="text-gray-600">
                {filteredPosts.length > 0 ? (
                  <>
                    {t('showing')} <span className="font-semibold text-gray-900">{filteredPosts.length}</span> {filteredPosts.length !== 1 ? t('articles') : t('article')}
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
                      onReport={handleReportPost}
                      onDeletePost={handleDeletePost}
                      currentUserId={user?._id || user?.user_id}
                      isAdmin={isAdmin}
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
                  No articles yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery ? 
                    "We couldn't find any articles matching your search. Try different keywords." :
                    "Be the first to share your insights!"
                  }
                </p>
                {user && !searchQuery && (
                  <button
                    onClick={() => navigate('/blog/create')}
                    className="px-8 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #21b4ca 0%, #1e90ff 100%)',
                    }}
                  >
                    Create Your First Post
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Top 5 Popular Posts - Right Side (1 column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Top 5 Popular Posts
              </h3>
              
              {popularPosts.length > 0 ? (
                <div className="space-y-4">
                  {popularPosts.map((post, index) => (
                    <div
                      key={post.id}
                      onClick={() => handlePostClick(post.id)}
                      className="group cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-cyan-600">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {post.viewCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {post.likeCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {post.commentCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      {index < popularPosts.length - 1 && (
                        <div className="mt-4 border-b border-gray-100"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No popular posts yet
                </p>
              )}
            </div>
          </div>
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
          alert('Report submitted successfully');
        }}
      />
    </div>
  );
};

export default BlogHomePage;