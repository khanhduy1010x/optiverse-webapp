import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  setCommentsLoading,
  setCommentsError,
  setComments,
  addComment,
  updateComment,
  removeComment
} from '../../store/slices/blog.slice';
import { CommentService } from '../../services/blog';
import { 
  BlogComment, 
  CreateBlogCommentRequest, 
  UpdateBlogCommentRequest 
} from '../../types/blog';

export function useComments(postId?: string) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    comments,
    commentsLoading,
    commentsError
  } = useSelector((state: RootState) => state.blog);

  /**
   * Lấy danh sách comments cho post
   */
  const fetchComments = useCallback(async (targetPostId?: string) => {
    const id = targetPostId || postId;
    if (!id) return;

    try {
      dispatch(setCommentsLoading(true));
      dispatch(setCommentsError(null));

      const fetchedComments = await CommentService.getCommentsByPost(id);
      dispatch(setComments(fetchedComments));
    } catch (error) {
      console.error('Error fetching comments:', error);
      dispatch(setCommentsError(error instanceof Error ? error.message : 'Failed to fetch comments'));
    } finally {
      dispatch(setCommentsLoading(false));
    }
  }, [dispatch, postId]);

  /**
   * Tạo comment mới
   */
  const createComment = useCallback(async (commentData: CreateBlogCommentRequest) => {
    try {
      dispatch(setCommentsLoading(true));
      dispatch(setCommentsError(null));

      const newComment = await CommentService.createComment(commentData);
      // Không dispatch addComment ngay lập tức vì newComment không có author info
      // Sẽ dựa vào fetchComments để refresh danh sách với đầy đủ thông tin
      
      return newComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      dispatch(setCommentsError(error instanceof Error ? error.message : 'Failed to create comment'));
      throw error;
    } finally {
      dispatch(setCommentsLoading(false));
    }
  }, [dispatch]);

  /**
   * Tạo reply cho comment
   */
  const createReply = useCallback(async (
    parentCommentId: string, 
    replyData: Omit<CreateBlogCommentRequest, 'parentId'>
  ) => {
    try {
      dispatch(setCommentsLoading(true));
      dispatch(setCommentsError(null));

      const newReply = await CommentService.createComment({
        ...replyData,
        parentId: parentCommentId
      });
      // Không dispatch addComment ngay lập tức vì newReply không có author info
      // Sẽ dựa vào fetchComments để refresh danh sách với đầy đủ thông tin
      
      return newReply;
    } catch (error) {
      console.error('Error creating reply:', error);
      dispatch(setCommentsError(error instanceof Error ? error.message : 'Failed to create reply'));
      throw error;
    } finally {
      dispatch(setCommentsLoading(false));
    }
  }, [dispatch]);

  /**
   * Cập nhật comment
   */
  const updateCommentById = useCallback(async (
    commentId: string, 
    commentData: UpdateBlogCommentRequest
  ) => {
    try {
      dispatch(setCommentsLoading(true));
      dispatch(setCommentsError(null));

      const updatedComment = await CommentService.updateComment(commentId, commentData);
      dispatch(updateComment(updatedComment));
      
      return updatedComment;
    } catch (error) {
      console.error('Error updating comment:', error);
      dispatch(setCommentsError(error instanceof Error ? error.message : 'Failed to update comment'));
      throw error;
    } finally {
      dispatch(setCommentsLoading(false));
    }
  }, [dispatch]);

  /**
   * Xóa comment
   */
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      dispatch(setCommentsLoading(true));
      dispatch(setCommentsError(null));

      await CommentService.deleteComment(commentId);
      dispatch(removeComment(commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      dispatch(setCommentsError(error instanceof Error ? error.message : 'Failed to delete comment'));
      throw error;
    } finally {
      dispatch(setCommentsLoading(false));
    }
  }, [dispatch]);

  /**
   * Like/Unlike comment
   */
  const toggleCommentLike = useCallback(async (commentId: string) => {
    try {
      const result = await CommentService.toggleCommentLike(commentId);
      
      // Cập nhật comment trong store
      const commentToUpdate = comments.find(c => c.id === commentId);
      if (commentToUpdate) {
        const updatedComment = {
          ...commentToUpdate,
          likeCount: result.likeCount,
          isLiked: result.isLiked
        };
        dispatch(updateComment(updatedComment));
      }
      
      return result;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  }, [dispatch, comments]);

  /**
   * Lấy replies cho comment
   */
  const fetchReplies = useCallback(async (commentId: string) => {
    try {
      const replies = await CommentService.getReplies(commentId);
      return replies;
    } catch (error) {
      console.error('Error fetching replies:', error);
      throw error;
    }
  }, []);

  /**
   * Kiểm tra user có thể edit comment không
   */
  const canEditComment = useCallback((comment: BlogComment) => {
    const userId = localStorage.getItem('user_id');
    return userId === comment.authorId;
  }, []);

  /**
   * Kiểm tra user có thể delete comment không
   */
  const canDeleteComment = useCallback((comment: BlogComment) => {
    const userId = localStorage.getItem('user_id');
    // User có thể xóa comment của mình hoặc nếu là author của post
    return userId === comment.authorId || userId === postId; // Cần check thêm logic author của post
  }, [postId]);

  /**
   * Format comment content (xử lý mentions, links, etc.)
   */
  const formatCommentContent = useCallback((content: string) => {
    // Xử lý mentions (@username)
    let formattedContent = content.replace(
      /@(\w+)/g, 
      '<span class="text-blue-500 font-medium">@$1</span>'
    );
    
    // Xử lý links
    formattedContent = formattedContent.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>'
    );
    
    return formattedContent;
  }, []);

  /**
   * Sắp xếp comments theo thời gian hoặc likes
   */
  const sortComments = useCallback((
    commentsToSort: BlogComment[], 
    sortBy: 'newest' | 'oldest' | 'most_liked' = 'newest'
  ) => {
    const sorted = [...commentsToSort];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      case 'most_liked':
        return sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      default:
        return sorted;
    }
  }, []);

  /**
   * Lọc comments theo parent (top-level comments vs replies)
   */
  const getTopLevelComments = useCallback(() => {
    return comments.filter(comment => !comment.parentId);
  }, [comments]);

  /**
   * Lấy replies cho một comment cụ thể
   */
  const getCommentReplies = useCallback((parentId: string) => {
    return comments.filter(comment => comment.parentId === parentId);
  }, [comments]);

  /**
   * Đếm tổng số comments (bao gồm replies)
   */
  const getTotalCommentCount = useCallback(() => {
    return comments.length;
  }, [comments]);

  /**
   * Đếm số replies cho một comment
   */
  const getReplyCount = useCallback((commentId: string) => {
    return comments.filter(comment => comment.parentId === commentId).length;
  }, [comments]);

  // Auto-fetch comments khi postId thay đổi
  useEffect(() => {
    if (postId) {
      fetchComments(postId);
    }
  }, [postId, fetchComments]);

  return {
    // State
    comments,
    commentsLoading,
    commentsError,
    
    // Actions
    fetchComments,
    createComment,
    createReply,
    updateCommentById,
    deleteComment,
    toggleCommentLike,
    fetchReplies,
    
    // Utilities
    canEditComment,
    canDeleteComment,
    formatCommentContent,
    sortComments,
    getTopLevelComments,
    getCommentReplies,
    getTotalCommentCount,
    getReplyCount,
    
    // Clear comments
    clearComments: () => dispatch(setComments([]))
  };
}