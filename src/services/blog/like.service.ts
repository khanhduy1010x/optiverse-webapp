import { ref, update, remove, get, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../../firebase';
import { BlogPost } from '../../types/blog';

class LikeService {
  private readonly POSTS_PATH = 'blogPosts';
  private readonly LIKES_PATH = 'blogLikes';
  private readonly BOOKMARKS_PATH = 'blogBookmarks';
  private readonly FOLLOWS_PATH = 'blogFollows';

  /**
   * Like/Unlike blog post
   */
  async togglePostLike(postId: string): Promise<{ isLiked: boolean; likeCount: number }> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const likeRef = ref(db, `${this.LIKES_PATH}/${postId}/${userId}`);
      const likeSnapshot = await get(likeRef);
      
      const postRef = ref(db, `${this.POSTS_PATH}/${postId}`);
      const postSnapshot = await get(postRef);
      
      if (!postSnapshot.exists()) {
        throw new Error('Post not found');
      }

      const post = postSnapshot.val() as BlogPost;
      let newLikeCount = post.likeCount || 0;
      let isLiked = false;

      if (likeSnapshot.exists()) {
        // Unlike
        await remove(likeRef);
        newLikeCount = Math.max(0, newLikeCount - 1);
        isLiked = false;
      } else {
        // Like
        await update(likeRef, {
          postId,
          userId,
          createdAt: Date.now()
        });
        newLikeCount += 1;
        isLiked = true;
      }

      // Cập nhật like count của post
      await update(postRef, {
        likeCount: newLikeCount
      });

      return { isLiked, likeCount: newLikeCount };
    } catch (error) {
      console.error('Error toggling post like:', error);
      throw error;
    }
  }

  /**
   * Bookmark/Unbookmark blog post
   */
  async togglePostBookmark(postId: string): Promise<{ isBookmarked: boolean; bookmarkCount: number }> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const bookmarkRef = ref(db, `${this.BOOKMARKS_PATH}/${userId}/${postId}`);
      const bookmarkSnapshot = await get(bookmarkRef);
      
      const postRef = ref(db, `${this.POSTS_PATH}/${postId}`);
      const postSnapshot = await get(postRef);
      
      if (!postSnapshot.exists()) {
        throw new Error('Post not found');
      }

      const post = postSnapshot.val() as BlogPost;
      let newBookmarkCount = post.bookmarkCount || 0;
      let isBookmarked = false;

      if (bookmarkSnapshot.exists()) {
        // Unbookmark
        await remove(bookmarkRef);
        newBookmarkCount = Math.max(0, newBookmarkCount - 1);
        isBookmarked = false;
      } else {
        // Bookmark
        await update(bookmarkRef, {
          postId,
          userId,
          createdAt: Date.now()
        });
        newBookmarkCount += 1;
        isBookmarked = true;
      }

      // Cập nhật bookmark count của post
      await update(postRef, {
        bookmarkCount: newBookmarkCount
      });

      return { isBookmarked, bookmarkCount: newBookmarkCount };
    } catch (error) {
      console.error('Error toggling post bookmark:', error);
      throw error;
    }
  }

  /**
   * Follow/Unfollow author
   */
  async toggleAuthorFollow(authorId: string): Promise<{ isFollowing: boolean; followerCount: number }> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      if (userId === authorId) {
        throw new Error('You cannot follow yourself');
      }

      const followRef = ref(db, `${this.FOLLOWS_PATH}/${userId}/${authorId}`);
      const followSnapshot = await get(followRef);
      
      // Lấy số lượng followers hiện tại
      const followersRef = ref(db, this.FOLLOWS_PATH);
      const followersQuery = query(followersRef, orderByChild('followingId'), equalTo(authorId));
      const followersSnapshot = await get(followersQuery);
      
      let followerCount = 0;
      if (followersSnapshot.exists()) {
        const followers = followersSnapshot.val();
        followerCount = Object.keys(followers).length;
      }

      let isFollowing = false;

      if (followSnapshot.exists()) {
        // Unfollow
        await remove(followRef);
        followerCount = Math.max(0, followerCount - 1);
        isFollowing = false;
      } else {
        // Follow
        await update(followRef, {
          followerId: userId,
          followingId: authorId,
          createdAt: Date.now()
        });
        followerCount += 1;
        isFollowing = true;
      }

      return { isFollowing, followerCount };
    } catch (error) {
      console.error('Error toggling author follow:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra user đã like post chưa
   */
  async isPostLiked(postId: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return false;

      const likeRef = ref(db, `${this.LIKES_PATH}/${postId}/${userId}`);
      const snapshot = await get(likeRef);
      
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking post like status:', error);
      return false;
    }
  }

  /**
   * Kiểm tra user đã bookmark post chưa
   */
  async isPostBookmarked(postId: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return false;

      const bookmarkRef = ref(db, `${this.BOOKMARKS_PATH}/${userId}/${postId}`);
      const snapshot = await get(bookmarkRef);
      
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking post bookmark status:', error);
      return false;
    }
  }

  /**
   * Kiểm tra user đã follow author chưa
   */
  async isAuthorFollowed(authorId: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return false;

      const followRef = ref(db, `${this.FOLLOWS_PATH}/${userId}/${authorId}`);
      const snapshot = await get(followRef);
      
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking author follow status:', error);
      return false;
    }
  }

  /**
   * Lấy danh sách posts đã like
   */
  async getLikedPosts(limit: number = 20, offset: number = 0): Promise<string[]> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return [];

      const likesRef = ref(db, this.LIKES_PATH);
      const snapshot = await get(likesRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const allLikes = snapshot.val();
      const userLikedPosts: string[] = [];

      // Duyệt qua tất cả posts để tìm likes của user
      Object.keys(allLikes).forEach(postId => {
        if (allLikes[postId][userId]) {
          userLikedPosts.push(postId);
        }
      });

      // Sắp xếp theo thời gian like (mới nhất trước)
      userLikedPosts.sort((a, b) => {
        const aTime = allLikes[a][userId]?.createdAt || 0;
        const bTime = allLikes[b][userId]?.createdAt || 0;
        return bTime - aTime;
      });

      // Phân trang
      return userLikedPosts.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error getting liked posts:', error);
      return [];
    }
  }

  /**
   * Lấy danh sách posts đã bookmark
   */
  async getBookmarkedPosts(limit: number = 20, offset: number = 0): Promise<string[]> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return [];

      const bookmarksRef = ref(db, `${this.BOOKMARKS_PATH}/${userId}`);
      const snapshot = await get(bookmarksRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const bookmarks = snapshot.val();
      const bookmarkedPosts = Object.keys(bookmarks);

      // Sắp xếp theo thời gian bookmark (mới nhất trước)
      bookmarkedPosts.sort((a, b) => {
        const aTime = bookmarks[a]?.createdAt || 0;
        const bTime = bookmarks[b]?.createdAt || 0;
        return bTime - aTime;
      });

      // Phân trang
      return bookmarkedPosts.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error getting bookmarked posts:', error);
      return [];
    }
  }

  /**
   * Lấy danh sách authors đang follow
   */
  async getFollowingAuthors(limit: number = 20, offset: number = 0): Promise<string[]> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return [];

      const followsRef = ref(db, `${this.FOLLOWS_PATH}/${userId}`);
      const snapshot = await get(followsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const follows = snapshot.val();
      const followingAuthors = Object.keys(follows);

      // Sắp xếp theo thời gian follow (mới nhất trước)
      followingAuthors.sort((a, b) => {
        const aTime = follows[a]?.createdAt || 0;
        const bTime = follows[b]?.createdAt || 0;
        return bTime - aTime;
      });

      // Phân trang
      return followingAuthors.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error getting following authors:', error);
      return [];
    }
  }

  /**
   * Lấy số lượng followers của author
   */
  async getAuthorFollowerCount(authorId: string): Promise<number> {
    try {
      const followsRef = ref(db, this.FOLLOWS_PATH);
      const snapshot = await get(followsRef);
      
      if (!snapshot.exists()) {
        return 0;
      }

      const allFollows = snapshot.val();
      let followerCount = 0;

      // Đếm số lượng users follow author này
      Object.keys(allFollows).forEach(userId => {
        if (allFollows[userId][authorId]) {
          followerCount++;
        }
      });

      return followerCount;
    } catch (error) {
      console.error('Error getting author follower count:', error);
      return 0;
    }
  }

  /**
   * Lấy số lượng authors mà user đang follow
   */
  async getUserFollowingCount(userId?: string): Promise<number> {
    try {
      const currentUserId = userId || localStorage.getItem('user_id');
      if (!currentUserId) return 0;

      const followsRef = ref(db, `${this.FOLLOWS_PATH}/${currentUserId}`);
      const snapshot = await get(followsRef);
      
      if (!snapshot.exists()) {
        return 0;
      }

      const follows = snapshot.val();
      return Object.keys(follows).length;
    } catch (error) {
      console.error('Error getting user following count:', error);
      return 0;
    }
  }
}

export default new LikeService();