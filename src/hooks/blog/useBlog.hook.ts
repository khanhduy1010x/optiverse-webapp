import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../../firebase';
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
  setHasMore
} from '../../store/slices/blog.slice';
import { BlogService, SearchService } from '../../services/blog';
import blogService from '../../services/blog/blog.service';
import { 
  BlogPost,
  BlogPostWithAuthor,
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
    selectedTags
  } = useSelector((state: RootState) => state.blog);

  // Track if real-time listener is active
  const listenerActiveRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  // Get current user ID from localStorage
  useEffect(() => {
    try {
      const userId = localStorage.getItem('user_id');
      currentUserIdRef.current = userId;
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
    }
  }, []);

  /**
   * Setup real-time listener for blog posts (MAIN BLOG ONLY - not workspace)
   */
  useEffect(() => {
    if (listenerActiveRef.current) return;
    
    console.log('📡 useBlog: Setting up real-time listener for main blog');
    listenerActiveRef.current = true;

    const postsRef = ref(db, 'blogPosts');
    
    const unsubscribe = onValue(
      postsRef,
      async (snapshot) => {
        try {
          const data = snapshot.val();

          if (!data) {
            console.log('⚠️ useBlog: No posts found');
            dispatch(setPosts([]));
            return;
          }

          // Filter MAIN blog posts (không có workspaceId)
          const mainBlogPosts = Object.entries(data)
            .filter(([_, post]: [string, any]) => !post.workspaceId)
            .map(([id, post]: [string, any]) => ({
              ...post,
              id
            })) as BlogPost[];

          console.log(`✅ useBlog: Found ${mainBlogPosts.length} main blog posts`);

          // Get author info for all posts
          const postsWithAuthors = await Promise.all(
            mainBlogPosts.map(async (post) => {
              try {
                const authorInfo = await blogService['getAuthorInfo'](post.authorId);
                
                // Check if current user liked this post
                let isLiked = false;
                if (currentUserIdRef.current) {
                  const likePath = `blogLikes/${post.id}/${currentUserIdRef.current}`;
                  const likeRef = ref(db, likePath);
                  const likeSnapshot = await get(likeRef);
                  isLiked = likeSnapshot.exists();
                }

                return {
                  ...post,
                  author: authorInfo,
                  isLiked
                } as BlogPostWithAuthor;
              } catch (error) {
                console.error(`Error fetching data for post ${post.id}:`, error);
                return {
                  ...post,
                  author: {
                    id: post.authorId,
                    userId: post.authorId,
                    name: 'Unknown',
                    displayName: 'Unknown User',
                    postCount: 0,
                    followerCount: 0,
                    followingCount: 0,
                    isVerified: false,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                  },
                  isLiked: false
                } as BlogPostWithAuthor;
              }
            })
          );

          // Sort by createdAt desc (newest first)
          postsWithAuthors.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

          dispatch(setPosts(postsWithAuthors));
        } catch (error) {
          console.error('❌ useBlog: Error in real-time listener:', error);
          dispatch(setPostsError(error instanceof Error ? error.message : 'Failed to fetch posts'));
        }
      },
      (error) => {
        console.error('❌ useBlog: Firebase listener error:', error);
        dispatch(setPostsError(error.message));
      }
    );

    return () => {
      console.log('🔌 useBlog: Cleaning up real-time listener');
      unsubscribe();
      listenerActiveRef.current = false;
    };
  }, [dispatch]);

  /**
   * Lấy danh sách blog posts (manual fetch - not needed with real-time listener)
   */
  const fetchPosts = useCallback(async (options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    reset?: boolean;
  }) => {
    // Real-time listener handles this automatically
    // This function kept for compatibility but does nothing
    console.log('ℹ️ fetchPosts called but real-time listener handles updates automatically');
  }, []);

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
   * Lấy bài viết phổ biến theo công thức Views (1x) + Likes (2x) + Comments (3x)
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
    // Simple excerpt generation
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  }, []);

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
    
    // Actions
    fetchPosts,
    fetchPostsByAuthor,
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
    
    // Clear current post
    clearCurrentPost: () => dispatch(setCurrentPost(null))
  };
}