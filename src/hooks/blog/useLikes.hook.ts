import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  setLikedPosts,
  toggleLikedPost,
  setBookmarkedPosts,
  toggleBookmarkedPost,
  setFollowingAuthors,
  toggleFollowingAuthor,
  updatePost
} from '../../store/slices/blog.slice';
import { LikeService, BlogService } from '../../services/blog';

export function useLikes() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    likedPosts,
    bookmarkedPosts,
    followingAuthors,
    posts,
    currentPost
  } = useSelector((state: RootState) => state.blog);

  /**
   * Like/Unlike blog post
   */
  const togglePostLike = useCallback(async (postId: string) => {
    try {
      const result = await LikeService.togglePostLike(postId);
      
      // Cập nhật Redux state
      dispatch(toggleLikedPost(postId));
      
      // Cập nhật like count và isLiked trong posts
      const postToUpdate = posts.find(p => p.id === postId) || currentPost;
      if (postToUpdate) {
        const updatedPost = {
          ...postToUpdate,
          likeCount: result.likeCount,
          isLiked: result.isLiked
        };
        dispatch(updatePost(updatedPost));
      }
      
      return result;
    } catch (error) {
      console.error('Error toggling post like:', error);
      throw error;
    }
  }, [dispatch, posts, currentPost]);

  /**
   * Bookmark/Unbookmark blog post
   */
  const togglePostBookmark = useCallback(async (postId: string) => {
    try {
      const result = await LikeService.togglePostBookmark(postId);
      
      // Cập nhật Redux state
      dispatch(toggleBookmarkedPost(postId));
      
      // Cập nhật bookmark count trong posts
      const postToUpdate = posts.find(p => p.id === postId) || currentPost;
      if (postToUpdate) {
        const updatedPost = {
          ...postToUpdate,
          bookmarkCount: result.bookmarkCount
        };
        dispatch(updatePost(updatedPost));
      }
      
      return result;
    } catch (error) {
      console.error('Error toggling post bookmark:', error);
      throw error;
    }
  }, [dispatch, posts, currentPost]);

  /**
   * Follow/Unfollow author
   */
  const toggleAuthorFollow = useCallback(async (authorId: string) => {
    try {
      const result = await LikeService.toggleAuthorFollow(authorId);
      
      // Cập nhật Redux state
      dispatch(toggleFollowingAuthor(authorId));
      
      return result;
    } catch (error) {
      console.error('Error toggling author follow:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Kiểm tra post đã được like chưa
   */
  const isPostLiked = useCallback((postId: string) => {
    return likedPosts.includes(postId);
  }, [likedPosts]);

  /**
   * Kiểm tra post đã được bookmark chưa
   */
  const isPostBookmarked = useCallback((postId: string) => {
    return bookmarkedPosts.includes(postId);
  }, [bookmarkedPosts]);

  /**
   * Kiểm tra author đã được follow chưa
   */
  const isAuthorFollowed = useCallback((authorId: string) => {
    return followingAuthors.includes(authorId);
  }, [followingAuthors]);

  /**
   * Lấy danh sách posts đã like
   */
  const fetchLikedPosts = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      const likedPostIds = await LikeService.getLikedPosts(limit, offset);
      if (offset === 0) {
        dispatch(setLikedPosts(likedPostIds));
      } else {
        // Append to existing liked posts
        const currentLiked = [...likedPosts];
        likedPostIds.forEach(id => {
          if (!currentLiked.includes(id)) {
            currentLiked.push(id);
          }
        });
        dispatch(setLikedPosts(currentLiked));
      }
      return likedPostIds;
    } catch (error) {
      console.error('Error fetching liked posts:', error);
      throw error;
    }
  }, [dispatch, likedPosts]);

  /**
   * Lấy danh sách posts đã bookmark
   */
  const fetchBookmarkedPosts = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      const bookmarkedPostIds = await LikeService.getBookmarkedPosts(limit, offset);
      if (offset === 0) {
        dispatch(setBookmarkedPosts(bookmarkedPostIds));
      } else {
        // Append to existing bookmarked posts
        const currentBookmarked = [...bookmarkedPosts];
        bookmarkedPostIds.forEach(id => {
          if (!currentBookmarked.includes(id)) {
            currentBookmarked.push(id);
          }
        });
        dispatch(setBookmarkedPosts(currentBookmarked));
      }
      return bookmarkedPostIds;
    } catch (error) {
      console.error('Error fetching bookmarked posts:', error);
      throw error;
    }
  }, [dispatch, bookmarkedPosts]);

  /**
   * Lấy danh sách authors đang follow
   */
  const fetchFollowingAuthors = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      const followingAuthorIds = await LikeService.getFollowingAuthors(limit, offset);
      if (offset === 0) {
        dispatch(setFollowingAuthors(followingAuthorIds));
      } else {
        // Append to existing following authors
        const currentFollowing = [...followingAuthors];
        followingAuthorIds.forEach(id => {
          if (!currentFollowing.includes(id)) {
            currentFollowing.push(id);
          }
        });
        dispatch(setFollowingAuthors(currentFollowing));
      }
      return followingAuthorIds;
    } catch (error) {
      console.error('Error fetching following authors:', error);
      throw error;
    }
  }, [dispatch, followingAuthors]);

  /**
   * Lấy số lượng followers của author
   */
  const getAuthorFollowerCount = useCallback(async (authorId: string) => {
    try {
      const count = await LikeService.getAuthorFollowerCount(authorId);
      return count;
    } catch (error) {
      console.error('Error getting author follower count:', error);
      return 0;
    }
  }, []);

  /**
   * Lấy số lượng authors mà user đang follow
   */
  const getUserFollowingCount = useCallback(async (userId?: string) => {
    try {
      const count = await LikeService.getUserFollowingCount(userId);
      return count;
    } catch (error) {
      console.error('Error getting user following count:', error);
      return 0;
    }
  }, []);

  /**
   * Kiểm tra trạng thái like/bookmark cho một post
   */
  const checkPostInteractionStatus = useCallback(async (postId: string) => {
    try {
      const [isLiked, isBookmarked] = await Promise.all([
        LikeService.isPostLiked(postId),
        LikeService.isPostBookmarked(postId)
      ]);
      
      return { isLiked, isBookmarked };
    } catch (error) {
      console.error('Error checking post interaction status:', error);
      return { isLiked: false, isBookmarked: false };
    }
  }, []);

  /**
   * Kiểm tra trạng thái follow cho một author
   */
  const checkAuthorFollowStatus = useCallback(async (authorId: string) => {
    try {
      const isFollowed = await LikeService.isAuthorFollowed(authorId);
      return isFollowed;
    } catch (error) {
      console.error('Error checking author follow status:', error);
      return false;
    }
  }, []);

  /**
   * Batch check interaction status cho nhiều posts
   */
  const batchCheckPostsInteractionStatus = useCallback(async (postIds: string[]) => {
    try {
      const results = await Promise.all(
        postIds.map(async (postId) => {
          const [isLiked, isBookmarked] = await Promise.all([
            LikeService.isPostLiked(postId),
            LikeService.isPostBookmarked(postId)
          ]);
          return { postId, isLiked, isBookmarked };
        })
      );
      
      // Cập nhật Redux state
      const likedPostIds = results.filter(r => r.isLiked).map(r => r.postId);
      const bookmarkedPostIds = results.filter(r => r.isBookmarked).map(r => r.postId);
      
      dispatch(setLikedPosts([...new Set([...likedPosts, ...likedPostIds])]));
      dispatch(setBookmarkedPosts([...new Set([...bookmarkedPosts, ...bookmarkedPostIds])]));
      
      return results;
    } catch (error) {
      console.error('Error batch checking posts interaction status:', error);
      return [];
    }
  }, [dispatch, likedPosts, bookmarkedPosts]);

  /**
   * Get interaction stats for a post
   */
  const getPostInteractionStats = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId) || currentPost;
    if (!post) return null;
    
    return {
      likeCount: post.likeCount || 0,
      bookmarkCount: post.bookmarkCount || 0,
      commentCount: post.commentCount || 0,
      viewCount: post.viewCount || 0,
      isLiked: isPostLiked(postId),
      isBookmarked: isPostBookmarked(postId)
    };
  }, [posts, currentPost, isPostLiked, isPostBookmarked]);

  /**
   * Lấy danh sách posts đã bookmark với thông tin đầy đủ
   */
  const fetchBookmarkedPostsWithDetails = useCallback(async (limit: number = 20, offset: number = 0) => {
    try {
      const bookmarkedPostIds = await LikeService.getBookmarkedPosts(limit, offset);
      
      // Fetch thông tin đầy đủ cho mỗi post
      const postsWithDetails = await Promise.all(
        bookmarkedPostIds.map(async (postId) => {
          try {
            const post = await BlogService.getPostById(postId);
            return post;
          } catch (error) {
            console.error(`Error fetching post ${postId}:`, error);
            return null;
          }
        })
      );

      // Filter out null values (posts that couldn't be fetched)
      const validPosts = postsWithDetails.filter(post => post !== null);
      
      return validPosts;
    } catch (error) {
      console.error('Error fetching bookmarked posts with details:', error);
      throw error;
    }
  }, []);

  // Auto-fetch user interactions khi component mount
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId && likedPosts.length === 0) {
      fetchLikedPosts(50, 0); // Fetch more initially
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId && bookmarkedPosts.length === 0) {
      fetchBookmarkedPosts(50, 0); // Fetch more initially
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId && followingAuthors.length === 0) {
      fetchFollowingAuthors(50, 0); // Fetch more initially
    }
  }, []);

  return {
    // State
    likedPosts,
    bookmarkedPosts,
    followingAuthors,
    
    // Actions
    togglePostLike,
    togglePostBookmark,
    toggleAuthorFollow,
    
    // Checkers
    isPostLiked,
    isPostBookmarked,
    isAuthorFollowed,
    
    // Fetchers
    fetchLikedPosts,
    fetchBookmarkedPosts,
    fetchFollowingAuthors,
    getAuthorFollowerCount,
    getUserFollowingCount,
    
    // Status checkers
    checkPostInteractionStatus,
    checkAuthorFollowStatus,
    batchCheckPostsInteractionStatus,
    
    // Utilities
    getPostInteractionStats,
    fetchBookmarkedPostsWithDetails
  };
}