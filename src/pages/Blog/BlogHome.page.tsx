import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  BlogList, 
  BlogSidebar, 
  SearchBar,
  ReportModal 
} from '../../components/blog';

import { useBlog, useSearch, useLikes, useReports } from '../../hooks/blog';
import { useAuthState } from "../../hooks/useAuthState.hook";
import { useAuthStatus } from '../../hooks/auth/useAuthStatus.hook';
import { BlogSortBy, BlogSearchFilters, SearchType } from '../../types/blog/blog.types';
import { BlogPostWithAuthor } from '../../types/blog';

const BlogHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<BlogSortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [popularPosts, setPopularPosts] = useState<BlogPostWithAuthor[]>([]);
  const [filters, setFilters] = useState<BlogSearchFilters>({
    query: '',
    tags: [],
    authorId: '',
    sortBy: BlogSortBy.CREATED_DESC,
    page: 0,
    limit: 20
  });

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string>('');
  const [reportPostTitle, setReportPostTitle] = useState<string>('');

  const {
    posts,
    trendingPosts,
    isLoading,
    error,
    pagination,
    fetchPosts,
    fetchPopularPosts,
    loadMorePosts,
    deletePost
  } = useBlog();

  const {
    searchResults,
    isSearching,
    searchPosts,
    clearSearch,
    popularTags,
    fetchPopularTags
  } = useSearch();

  const { user } = useAuthState();
  const { isAdmin } = useAuthStatus();
  const { togglePostLike } = useLikes();
  const { createReport } = useReports();

  // Ref cho scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Function để scroll lên đầu
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Xử lý URL search params khi component mount
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      setSearchType('tags');
      searchPosts({ 
        query: searchParam, 
        searchType: 'tags' 
      });
    } else {
      fetchPosts({ 
        page: 0, 
        limit: 12, 
        sortBy
      });
    }
  }, [searchParams, sortBy]);

  useEffect(() => {
    if (!searchParams.get('search')) {
      fetchPosts({ 
        page: 0, 
        limit: 12, 
        sortBy
      });
    }
  }, [sortBy]);

  // Tự động search lại khi searchType thay đổi
  useEffect(() => {
    if (searchQuery.trim()) {
      searchPosts({
        query: searchQuery,
        searchType: searchType
      });
    }
  }, [searchType]);

  // Fetch popular posts khi component mount
  useEffect(() => {
    const loadPopularPosts = async () => {
      try {
        const popular = await fetchPopularPosts(5);
        setPopularPosts(popular);
      } catch (error) {
        console.error('Error fetching popular posts:', error);
      }
    };

    loadPopularPosts();
  }, [fetchPopularPosts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, query }));
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
    setFilters(prev => ({ ...prev, query: '' }));
    clearSearch();
  };

  const handlePostClick = (postId: string) => {
    navigate(`/blog/post/${postId}`);
  };

  const handleLike = async (postId: string) => {
    try {
      await togglePostLike(postId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      // Refresh posts after deletion
      await fetchPosts({ page: 0, limit: 12, sortBy, reset: true });
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleReport = (postId: string, postTitle: string) => {
    setReportPostId(postId);
    setReportPostTitle(postTitle);
    setReportModalOpen(true);
  };

  const handleReportSuccess = () => {
    setReportModalOpen(false);
    setReportPostId('');
    setReportPostTitle('');
    // Có thể thêm toast notification ở đây
  };

  const handleTagClick = (tagName: string) => {
    setSearchQuery(tagName);
    setSearchType('tags');
    searchPosts({ 
      query: tagName, 
      searchType: 'tags' 
    });
  };

  const handleLoadMore = () => {
    if (searchQuery) {
      // Load more search results
      searchPosts({
        query: searchQuery,
        searchType: searchType
      });
    } else {
      // Load more regular posts
      loadMorePosts();
    }
  };

  const displayPosts = searchQuery ? searchResults : posts;
  const showLoadMore = searchQuery 
    ? searchResults.length > 0 && searchResults.length % 12 === 0
    : pagination.hasMore;

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Blog
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Khám phá những bài viết thú vị và hữu ích
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/blog/bookmarks')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105"
                >
                  <svg className="h-4 w-4 mr-2 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Bài đã lưu
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/blog/reports')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105"
                  >
                    <svg className="h-4 w-4 mr-2 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Báo cáo
                  </button>
                )}
                <button
                  onClick={() => navigate('/blog/create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#21B4CA] hover:bg-[#1a9bb0] transition-all duration-200 ease-in-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#21B4CA] transform hover:scale-105"
                >
                  <svg className="h-4 w-4 mr-2 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Viết bài mới
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <SearchBar
                  value={searchQuery}
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  placeholder={
                    searchType === 'title' ? 'Tìm kiếm theo tiêu đề...' :
                    searchType === 'author' ? 'Tìm kiếm theo tác giả...' :
                    searchType === 'content' ? 'Tìm kiếm theo nội dung...' :
                    searchType === 'tags' ? 'Tìm kiếm theo tags...' :
                    'Tìm kiếm bài viết...'
                  }
                  className="w-full"
                />
              </div>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as SearchType)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="title">Tiêu đề</option>
                <option value="author">Tác giả</option>
                <option value="content">Nội dung</option>
                <option value="tags">Tags</option>
              </select>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Results
                </button>
              )}
            </div>
          </div>

          {/* Sort Options - Fixed */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sắp xếp:
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSortBy('newest');
                    scrollToTop();
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    sortBy === 'newest'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => {
                    setSortBy('popular');
                    scrollToTop();
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    sortBy === 'popular'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  Phổ biến
                </button>
              </div>
            </div>

            {searchQuery && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tìm thấy {searchResults.length} kết quả cho "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
            {/* Main Content - Scrollable */}
            <div ref={scrollContainerRef} className="lg:col-span-3 overflow-y-auto pr-4 blog-list-scrollbar">
              <div className="py-6">

                {/* Blog Posts */}
                {error ? (
                  <div className="text-center py-12">
                    <div className="text-red-600 dark:text-red-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Có lỗi xảy ra
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {error}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <BlogList
                    posts={displayPosts}
                    loading={isLoading || isSearching}
                    onPostClick={handlePostClick}
                    onLike={handleLike}
                    onDelete={handleDelete}
                    onReport={handleReport}
                    currentUserId={user?.user_id}
                    onLoadMore={showLoadMore ? handleLoadMore : undefined}
                    hasMore={showLoadMore}
                    onTagClick={handleTagClick}
                    isAdmin={isAdmin}
                  />
                )}
              </div>
            </div>

            {/* Sidebar - Fixed */}
            <div className="lg:col-span-1 overflow-y-auto">
              <div className="sticky top-0 py-6">
                <BlogSidebar
                  popularPosts={popularPosts}
                  tags={popularTags}
                  onPostClick={handlePostClick}
                  onTagClick={handleTagClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        postId={reportPostId}
        postTitle={reportPostTitle}
        onReportSuccess={handleReportSuccess}
      />
    </div>
  );
};

export default BlogHomePage;