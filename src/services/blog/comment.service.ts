import { ref, push, update, remove, get, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../../firebase';
import api from '../api.service';
import { 
  BlogComment,
  BlogCommentWithAuthor,
  CreateBlogCommentRequest,
  UpdateBlogCommentRequest
} from '../../types/blog';
import { ApiResponse } from '../../types/api/api.interface';

class CommentService {
  private readonly COMMENTS_PATH = 'blogComments';
  private readonly POSTS_PATH = 'blogPosts';
  private readonly COMMENT_LIKES_PATH = 'blogCommentLikes';

  /**
   * Tạo comment mới
   */
  async createComment(commentData: CreateBlogCommentRequest): Promise<BlogComment> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Kiểm tra post có tồn tại không
      const postExists = await this.checkPostExists(commentData.postId);
      if (!postExists) {
        throw new Error('Post not found');
      }

      // Kiểm tra parent comment nếu có
      if (commentData.parentId) {
        const parentExists = await this.checkCommentExists(commentData.parentId);
        if (!parentExists) {
          throw new Error('Parent comment not found');
        }
      }

      const commentRef = push(ref(db, this.COMMENTS_PATH));
      const commentId = commentRef.key!;

      const newComment: BlogComment = {
        id: commentId,
        postId: commentData.postId,
        authorId: userId,
        content: commentData.content,
        parentId: commentData.parentId || null,
        likeCount: 0,
        replyCount: 0,
        isEdited: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await update(commentRef, newComment);

      // Cập nhật comment count của post
      await this.updatePostCommentCount(commentData.postId);

      // Cập nhật reply count của parent comment nếu có
      if (commentData.parentId) {
        await this.updateCommentReplyCount(commentData.parentId);
      }

      return newComment;
    } catch (error) {
      console.error('Error creating blog comment:', error);
      throw error;
    }
  }

  /**
   * Cập nhật comment
   */
  async updateComment(commentId: string, commentData: UpdateBlogCommentRequest): Promise<BlogComment> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const commentRef = ref(db, `${this.COMMENTS_PATH}/${commentId}`);
      const snapshot = await get(commentRef);
      
      if (!snapshot.exists()) {
        throw new Error('Comment not found');
      }

      const existingComment = snapshot.val() as BlogComment;
      
      // Kiểm tra quyền sở hữu
      if (existingComment.authorId !== userId) {
        throw new Error('You do not have permission to edit this comment');
      }

      const updatedComment: Partial<BlogComment> = {
        content: commentData.content,
        isEdited: true,
        updatedAt: Date.now()
      };

      await update(commentRef, updatedComment);
      
      const updatedSnapshot = await get(commentRef);
      return updatedSnapshot.val() as BlogComment;
    } catch (error) {
      console.error('Error updating blog comment:', error);
      throw error;
    }
  }

  /**
   * Xóa comment
   */
  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const commentRef = ref(db, `${this.COMMENTS_PATH}/${commentId}`);
      const snapshot = await get(commentRef);
      
      if (!snapshot.exists()) {
        throw new Error('Comment not found');
      }

      const comment = snapshot.val() as BlogComment;
      
      // Kiểm tra quyền sở hữu
      if (comment.authorId !== userId) {
        throw new Error('You do not have permission to delete this comment');
      }

      // Xóa tất cả replies của comment này
      await this.deleteCommentReplies(commentId);

      // Xóa comment
      await remove(commentRef);

      // Cập nhật comment count của post
      await this.updatePostCommentCount(comment.postId);

      // Cập nhật reply count của parent comment nếu có
      if (comment.parentId) {
        await this.updateCommentReplyCount(comment.parentId);
      }

      // Xóa likes của comment
      await this.deleteCommentLikes(commentId);

      return true;
    } catch (error) {
      console.error('Error deleting blog comment:', error);
      throw error;
    }
  }

  /**
   * Lấy comment theo ID
   */
  async getCommentById(commentId: string): Promise<BlogComment | null> {
    try {
      const commentRef = ref(db, `${this.COMMENTS_PATH}/${commentId}`);
      const snapshot = await get(commentRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as BlogComment;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting blog comment:', error);
      throw error;
    }
  }

  /**
   * Lấy comments của một post
   */
  async getCommentsByPost(postId: string, limit: number = 20, offset: number = 0): Promise<BlogCommentWithAuthor[]> {
    try {
      const commentsRef = ref(db, this.COMMENTS_PATH);
      const snapshot = await get(commentsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const comments = snapshot.val();
      let commentsArray = Object.values(comments) as BlogComment[];
      
      // Filter comments by postId on client side
      commentsArray = commentsArray.filter(comment => comment.postId === postId);

      // Sắp xếp tất cả comments theo thời gian tạo (mới nhất trước)
      commentsArray.sort((a, b) => b.createdAt - a.createdAt);

      // Lấy thông tin author và isLiked cho tất cả comments
      const commentsWithAuthor = await Promise.all(
        commentsArray.map(async (comment) => {
          const authorInfo = await this.getAuthorInfo(comment.authorId);
          const isLiked = await this.isCommentLiked(comment.id);
          return {
            ...comment,
            author: authorInfo,
            isLiked
          } as BlogCommentWithAuthor;
        })
      );

      return commentsWithAuthor;
    } catch (error) {
      console.error('Error getting comments by post:', error);
      throw error;
    }
  }

  /**
   * Lấy replies của một comment
   */
  async getCommentReplies(parentId: string): Promise<BlogCommentWithAuthor[]> {
    try {
      const commentsRef = ref(db, this.COMMENTS_PATH);
      const snapshot = await get(commentsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const replies = snapshot.val();
      let repliesArray = Object.values(replies) as BlogComment[];
      
      // Filter replies by parentId on client side
      repliesArray = repliesArray.filter(comment => comment.parentId === parentId);

      // Sắp xếp theo thời gian tạo (cũ nhất trước)
      repliesArray.sort((a, b) => a.createdAt - b.createdAt);

      // Lấy thông tin author và isLiked cho mỗi reply
      const repliesWithAuthor = await Promise.all(
        repliesArray.map(async (reply) => {
          const authorInfo = await this.getAuthorInfo(reply.authorId);
          const isLiked = await this.isCommentLiked(reply.id);
          return {
            ...reply,
            author: authorInfo,
            isLiked
          } as BlogCommentWithAuthor;
        })
      );

      return repliesWithAuthor;
    } catch (error) {
      console.error('Error getting comment replies:', error);
      throw error;
    }
  }

  /**
   * Like/Unlike comment
   */
  async toggleCommentLike(commentId: string): Promise<{ isLiked: boolean; likeCount: number }> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const likeRef = ref(db, `${this.COMMENT_LIKES_PATH}/${commentId}/${userId}`);
      const likeSnapshot = await get(likeRef);
      
      const commentRef = ref(db, `${this.COMMENTS_PATH}/${commentId}`);
      const commentSnapshot = await get(commentRef);
      
      if (!commentSnapshot.exists()) {
        throw new Error('Comment not found');
      }

      const comment = commentSnapshot.val() as BlogComment;
      let newLikeCount = comment.likeCount || 0;
      let isLiked = false;

      if (likeSnapshot.exists()) {
        // Unlike
        await remove(likeRef);
        newLikeCount = Math.max(0, newLikeCount - 1);
        isLiked = false;
      } else {
        // Like
        await update(likeRef, {
          commentId,
          userId,
          createdAt: Date.now()
        });
        newLikeCount += 1;
        isLiked = true;
      }

      // Cập nhật like count của comment
      await update(commentRef, {
        likeCount: newLikeCount
      });

      return { isLiked, likeCount: newLikeCount };
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra user đã like comment chưa
   */
  async isCommentLiked(commentId: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return false;

      const likeRef = ref(db, `${this.COMMENT_LIKES_PATH}/${commentId}/${userId}`);
      const snapshot = await get(likeRef);
      
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking comment like status:', error);
      return false;
    }
  }

  /**
   * Kiểm tra post có tồn tại không
   */
  private async checkPostExists(postId: string): Promise<boolean> {
    try {
      const postRef = ref(db, `${this.POSTS_PATH}/${postId}`);
      const snapshot = await get(postRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking post existence:', error);
      return false;
    }
  }

  /**
   * Kiểm tra comment có tồn tại không
   */
  private async checkCommentExists(commentId: string): Promise<boolean> {
    try {
      const commentRef = ref(db, `${this.COMMENTS_PATH}/${commentId}`);
      const snapshot = await get(commentRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking comment existence:', error);
      return false;
    }
  }

  /**
   * Cập nhật comment count của post
   */
  private async updatePostCommentCount(postId: string): Promise<void> {
    try {
      const commentsRef = ref(db, this.COMMENTS_PATH);
      const snapshot = await get(commentsRef);
      
      let commentCount = 0;
      if (snapshot.exists()) {
        const comments = snapshot.val();
        // Filter comments có postId = postId trên client
        commentCount = Object.values(comments).filter((comment: any) => comment.postId === postId).length;
      }
      
      const postRef = ref(db, `${this.POSTS_PATH}/${postId}`);
      await update(postRef, {
        commentCount
      });
    } catch (error) {
      console.error('Error updating post comment count:', error);
      throw error;
    }
  }

  /**
   * Cập nhật reply count của comment
   */
  private async updateCommentReplyCount(commentId: string): Promise<void> {
    try {
      const commentsRef = ref(db, this.COMMENTS_PATH);
      const snapshot = await get(commentsRef);
      
      let replyCount = 0;
      if (snapshot.exists()) {
        const comments = snapshot.val();
        // Filter comments có parentId = commentId trên client
        replyCount = Object.values(comments).filter((comment: any) => comment.parentId === commentId).length;
      }
      
      const commentRef = ref(db, `${this.COMMENTS_PATH}/${commentId}`);
      await update(commentRef, {
        replyCount
      });
    } catch (error) {
      console.error('Error updating comment reply count:', error);
    }
  }

  /**
   * Xóa tất cả replies của một comment
   */
  private async deleteCommentReplies(commentId: string): Promise<void> {
    try {
      const commentsRef = ref(db, this.COMMENTS_PATH);
      const snapshot = await get(commentsRef);
      
      if (snapshot.exists()) {
        const comments = snapshot.val();
        // Filter comments có parentId = commentId trên client
        const replies = Object.entries(comments).filter(([_, comment]: [string, any]) => comment.parentId === commentId);
        
        const deletePromises = replies.map(([replyId, _]) => {
          const replyRef = ref(db, `${this.COMMENTS_PATH}/${replyId}`);
          return remove(replyRef);
        });
        
        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error('Error deleting comment replies:', error);
    }
  }

  /**
   * Xóa tất cả likes của một comment
   */
  private async deleteCommentLikes(commentId: string): Promise<void> {
    try {
      const likesRef = ref(db, `${this.COMMENT_LIKES_PATH}/${commentId}`);
      await remove(likesRef);
    } catch (error) {
      console.error('Error deleting comment likes:', error);
    }
  }

  /**
   * Lấy thông tin author
   */
  private async getAuthorInfo(authorId: string) {
    try {
      // Gọi API để lấy thông tin user
      const response = await api.post<ApiResponse<any>>(
        '/core/auth/get-users-by-ids',
        { userIds: [authorId] }
      );

      const users = response.data.data || [];
      if (users.length > 0) {
        const user = users[0];
        // Map UserResponse to BlogAuthor
        return {
          id: user.user_id,
          userId: user.user_id,
          name: user.full_name || user.email || 'Unknown User',
          displayName: user.full_name || user.email || 'Unknown User',
          bio: '',
          avatar: user.avatar_url,
          website: '',
          socialLinks: {},
          postCount: 0,
          followerCount: 0,
          followingCount: 0,
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
      }
      
      // Fallback: nếu không tìm thấy user từ API, sử dụng thông tin từ localStorage
      return this.getFallbackAuthorInfo(authorId);
    } catch (error) {
      console.error('Error getting author info:', error);
      // Fallback: sử dụng thông tin từ localStorage
      return this.getFallbackAuthorInfo(authorId);
    }
  }

  /**
   * Lấy thông tin author fallback từ localStorage
   */
  private getFallbackAuthorInfo(authorId: string) {
    const currentUserId = localStorage.getItem('user_id');
    
    // Nếu là user hiện tại, lấy thông tin từ localStorage
    if (currentUserId === authorId) {
      const userEmail = localStorage.getItem('user_email');
      const userName = localStorage.getItem('user_name') || localStorage.getItem('full_name');
      const userAvatar = localStorage.getItem('avatar_url');
      
      return {
        id: authorId,
        userId: authorId,
        name: userName || userEmail || 'Current User',
        displayName: userName || userEmail || 'Current User',
        bio: '',
        avatar: userAvatar,
        website: '',
        socialLinks: {},
        postCount: 0,
        followerCount: 0,
        followingCount: 0,
        isVerified: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    }
    
    // Nếu không phải user hiện tại, trả về thông tin mặc định
    return {
      id: authorId,
      userId: authorId,
      name: 'Unknown User',
      displayName: 'Unknown User',
      bio: '',
      avatar: null,
      website: '',
      socialLinks: {},
      postCount: 0,
      followerCount: 0,
      followingCount: 0,
      isVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
}

export default new CommentService();