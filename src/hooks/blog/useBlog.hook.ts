import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  setPostsLoading,
  setPostsError,
  setPosts,
  addPost,
  updatePost,
  removePost,
  setCurrentPost,
  appendPosts,
  setCurrentPage,
  setHasMore,
  setTrendingPosts
} from '../../store/slices/blog.slice';
import { BlogService, SearchService } from '../../services/blog';
import { 
  BlogPost, 
  CreateBlogPostRequest, 
  UpdateBlogPostRequest
} from '../../types/blog';

export function useBlog() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    posts,
    currentPost,
    postsLoading,
    postsError,
    currentPage,
    hasMore,
    sortBy,
    selectedTags,
    trendingPosts
  } = useSelector((state: RootState) => state.blog);

  /**
   * Lấy danh sách blog posts
   */
  const fetchPosts = useCallback(async (options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    reset?: boolean;
  }) => {
    const {
      page = 0,
      limit = 20,
      sortBy: optionSortBy,
      reset = false
    } = options || {};

    try {
      dispatch(setPostsLoading(true));
      dispatch(setPostsError(null));

      const currentSortBy = optionSortBy || sortBy;
      const fetchedPosts = await BlogService.getPosts({ sortBy: currentSortBy }, limit, page * limit);
      
      if (reset || page === 0) {
        dispatch(setPosts(fetchedPosts));
        dispatch(setCurrentPage(0));
      } else {
        dispatch(appendPosts(fetchedPosts));
        dispatch(setCurrentPage(page));
      }

      // Kiểm tra có còn posts để load không
      dispatch(setHasMore(fetchedPosts.length === limit));
    } catch (error) {
      console.error('Error fetching posts:', error);
      dispatch(setPostsError(error instanceof Error ? error.message : 'Failed to fetch posts'));
    } finally {
      dispatch(setPostsLoading(false));
    }
  }, [dispatch, sortBy]);

  /**
   * Lấy posts theo author
   */
  const fetchPostsByAuthor = useCallback(async (
    authorId: string,
    page: number = 0,
    limit: number = 20,
    reset: boolean = false
  ) => {
    try {
      dispatch(setPostsLoading(true));
      dispatch(setPostsError(null));

      const fetchedPosts = await SearchService.searchPostsByAuthor(authorId, limit, page * limit);
      
      if (reset || page === 0) {
        dispatch(setPosts(fetchedPosts));
        dispatch(setCurrentPage(0));
      } else {
        dispatch(appendPosts(fetchedPosts));
        dispatch(setCurrentPage(page));
      }

      dispatch(setHasMore(fetchedPosts.length === limit));
    } catch (error) {
      console.error('Error fetching posts by author:', error);
      dispatch(setPostsError(error instanceof Error ? error.message : 'Failed to fetch posts'));
    } finally {
      dispatch(setPostsLoading(false));
    }
  }, [dispatch]);

  /**
   * Lấy trending posts
   */
  const fetchTrendingPosts = useCallback(async (days: number = 7, limit: number = 10) => {
    try {
      const trending = await SearchService.getTrendingPosts(days, limit);
      dispatch(setTrendingPosts(trending));
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    }
  }, [dispatch]);

  /**
   * Lấy bài viết phổ biến theo công thức Views (1x) + Likes (3x) + Comments (5x)
   */
  const fetchPopularPosts = useCallback(async (limit: number = 5) => {
    try {
      const popularPosts = await BlogService.getPopularPosts(limit);
      return popularPosts;
    } catch (error) {
      console.error('Error fetching popular posts:', error);
      return [];
    }
  }, []);

  /**
   * Lấy chi tiết blog post
   */
  const fetchPostById = useCallback(async (postId: string) => {
    try {
      dispatch(setPostsLoading(true));
      dispatch(setPostsError(null));

      const post = await BlogService.getPostById(postId);
      dispatch(setCurrentPost(post));

      // Tăng view count
      await BlogService.incrementViewCount(postId);
      
      return post;
    } catch (error) {
      console.error('Error fetching post:', error);
      dispatch(setPostsError(error instanceof Error ? error.message : 'Failed to fetch post'));
      throw error;
    } finally {
      dispatch(setPostsLoading(false));
    }
  }, [dispatch]);

  /**
   * Tạo blog post mới
   */
  const createPost = useCallback(async (postData: CreateBlogPostRequest) => {
    try {
      dispatch(setPostsLoading(true));
      dispatch(setPostsError(null));

      const newPost = await BlogService.createPost(postData);
      dispatch(addPost(newPost));
      
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      dispatch(setPostsError(error instanceof Error ? error.message : 'Failed to create post'));
      throw error;
    } finally {
      dispatch(setPostsLoading(false));
    }
  }, [dispatch]);

  /**
   * Cập nhật blog post
   */
  const updatePostById = useCallback(async (postId: string, postData: UpdateBlogPostRequest) => {
    try {
      dispatch(setPostsLoading(true));
      dispatch(setPostsError(null));

      const updatedPost = await BlogService.updatePost(postId, postData);
      dispatch(updatePost(updatedPost));
      
      return updatedPost;
    } catch (error) {
      console.error('Error updating post:', error);
      dispatch(setPostsError(error instanceof Error ? error.message : 'Failed to update post'));
      throw error;
    } finally {
      dispatch(setPostsLoading(false));
    }
  }, [dispatch]);

  /**
   * Xóa blog post
   */
  const deletePost = useCallback(async (postId: string) => {
    try {
      dispatch(setPostsLoading(true));
      dispatch(setPostsError(null));

      await BlogService.deletePost(postId);
      dispatch(removePost(postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      dispatch(setPostsError(error instanceof Error ? error.message : 'Failed to delete post'));
      throw error;
    } finally {
      dispatch(setPostsLoading(false));
    }
  }, [dispatch]);

  /**
   * Load more posts (pagination)
   */
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || postsLoading) return;

    const nextPage = currentPage + 1;
    await fetchPosts({ page: nextPage, limit: 20, reset: false });
  }, [hasMore, postsLoading, currentPage, fetchPosts]);

  /**
   * Refresh posts
   */
  const refreshPosts = useCallback(async () => {
    await fetchPosts({ page: 0, limit: 20, reset: true });
  }, [fetchPosts]);

  /**
   * Upload image cho blog post
   */
  const uploadImage = useCallback(async (file: File) => {
    try {
      const imageUrl = await BlogService.uploadImage(file);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }, []);



  /**
   * Generate excerpt từ content
   */
  const generateExcerpt = useCallback((content: string, maxLength: number = 200) => {
    return BlogService.generateExcerpt(content, maxLength);
  }, []);

  /**
   * Tính read time
   */
  const calculateReadTime = useCallback((content: string) => {
    return BlogService.calculateReadTime(content);
  }, []);

  // Auto-fetch posts khi component mount
  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts(0, 20, true);
    }
  }, []);

  // Auto-fetch trending posts
  useEffect(() => {
    if (trendingPosts.length === 0) {
      fetchTrendingPosts();
    }
  }, [fetchTrendingPosts, trendingPosts.length]);

  return {
    // State
    posts,
    currentPost,
    postsLoading,
    postsError,
    pagination: {
      currentPage,
      hasMore
    },
    trendingPosts,
    
    // Actions
    fetchPosts,
    fetchPostsByAuthor,
    fetchTrendingPosts,
    fetchPopularPosts,
    fetchPostById,
    createPost,
    updatePostById,
    deletePost,
    loadMorePosts,
    refreshPosts,
    
    // Utilities
    uploadImage,
    generateExcerpt,
    calculateReadTime,
    
    // Clear current post
    clearCurrentPost: () => dispatch(setCurrentPost(null))
  };
}