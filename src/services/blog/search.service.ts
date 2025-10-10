import { ref, get, query, orderByChild, equalTo, limitToFirst, limitToLast } from 'firebase/database';
import { db } from '../../firebase';
import { BlogPost, BlogSearchFilters, BlogSortBy, BlogPostStatus } from '../../types/blog';

class SearchService {
  private readonly POSTS_PATH = 'blogPosts';
  private readonly TAGS_PATH = 'blogTags';

  /**
   * Tìm kiếm blog posts với filters
   */
  async searchPosts(filters: BlogSearchFilters): Promise<BlogPost[]> {
    try {
      const postsRef = ref(db, this.POSTS_PATH);
      let postsQuery = query(postsRef);

      // Lấy tất cả posts trước, sau đó filter
      const snapshot = await get(postsQuery);
      
      if (!snapshot.exists()) {
        return [];
      }

      let posts = Object.entries(snapshot.val()).map(([id, post]) => ({
        id,
        ...post as BlogPost
      }));

      // Filter theo status (chỉ lấy published posts nếu không phải admin)
      const userId = localStorage.getItem('user_id');
      posts = posts.filter(post => {
        if (post.status === BlogPostStatus.PUBLISHED) return true;
        if (post.status === BlogPostStatus.DRAFT && post.authorId === userId) return true;
        return false;
      });

      // Filter theo search query
      if (filters.query) {
        const searchQuery = filters.query.toLowerCase();
        posts = posts.filter(post => 
          post.title.toLowerCase().includes(searchQuery) ||
          post.content.toLowerCase().includes(searchQuery) ||
          post.excerpt?.toLowerCase().includes(searchQuery) ||
          post.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
        );
      }

      // Filter theo tags
      if (filters.tags && filters.tags.length > 0) {
        posts = posts.filter(post => 
          post.tags?.some(tag => filters.tags!.includes(tag))
        );
      }

      // Filter theo author
      if (filters.authorId) {
        posts = posts.filter(post => post.authorId === filters.authorId);
      }

      // Filter theo date range
      if (filters.startDate) {
        posts = posts.filter(post => post.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        posts = posts.filter(post => post.createdAt <= filters.endDate!);
      }

      // Filter theo isPublic
      if (filters.isPublic !== undefined) {
        posts = posts.filter(post => post.isPublic === filters.isPublic);
      }

      // Sorting
      posts = this.sortPosts(posts, filters.sortBy || BlogSortBy.CREATED_DESC);

      // Pagination
      const startIndex = (filters.page || 0) * (filters.limit || 20);
      const endIndex = startIndex + (filters.limit || 20);
      
      return posts.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm posts theo tag
   */
  async searchPostsByTag(tag: string, limit: number = 20, offset: number = 0): Promise<BlogPost[]> {
    try {
      const postsRef = ref(db, this.POSTS_PATH);
      const snapshot = await get(postsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      let posts = Object.entries(snapshot.val()).map(([id, post]) => ({
        id,
        ...post as BlogPost
      }));

      // Filter theo tag và status
      const userId = localStorage.getItem('user_id');
      posts = posts.filter(post => {
        const hasTag = post.tags?.includes(tag);
        const isVisible = post.status === BlogPostStatus.PUBLISHED || 
                         (post.status === BlogPostStatus.DRAFT && post.authorId === userId);
        return hasTag && isVisible;
      });

      // Sort theo created date (mới nhất trước)
      posts.sort((a, b) => b.createdAt - a.createdAt);

      // Pagination
      return posts.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error searching posts by tag:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm posts theo author
   */
  async searchPostsByAuthor(authorId: string, limit: number = 20, offset: number = 0): Promise<BlogPost[]> {
    try {
      const postsRef = ref(db, this.POSTS_PATH);
      const authorQuery = query(postsRef, orderByChild('authorId'), equalTo(authorId));
      const snapshot = await get(authorQuery);
      
      if (!snapshot.exists()) {
        return [];
      }

      let posts = Object.entries(snapshot.val()).map(([id, post]) => ({
        id,
        ...post as BlogPost
      }));

      // Filter theo status (chỉ hiển thị published posts hoặc draft của chính user)
      const currentUserId = localStorage.getItem('user_id');
      posts = posts.filter(post => {
        return post.status === BlogPostStatus.PUBLISHED || 
               (post.status === BlogPostStatus.DRAFT && post.authorId === currentUserId);
      });

      // Sort theo created date (mới nhất trước)
      posts.sort((a, b) => b.createdAt - a.createdAt);

      // Pagination
      return posts.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error searching posts by author:', error);
      throw error;
    }
  }

  /**
   * Lấy trending posts (posts có nhiều views, likes trong khoảng thời gian gần đây)
   */
  async getTrendingPosts(days: number = 7, limit: number = 10): Promise<BlogPost[]> {
    try {
      const postsRef = ref(db, this.POSTS_PATH);
      const snapshot = await get(postsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
      
      let posts = Object.entries(snapshot.val()).map(([id, post]) => ({
        id,
        ...post as BlogPost
      }));

      // Filter posts trong khoảng thời gian và published
      posts = posts.filter(post => 
        post.createdAt >= cutoffTime && 
        post.status === BlogPostStatus.PUBLISHED &&
        post.isPublic
      );

      // Tính trending score (views * 1 + likes * 3 + comments * 5)
      posts = posts.map(post => ({
        ...post,
        trendingScore: (post.viewCount || 0) * 1 + 
                      (post.likeCount || 0) * 3 + 
                      (post.commentCount || 0) * 5
      }));

      // Sort theo trending score
      posts.sort((a, b) => (b as any).trendingScore - (a as any).trendingScore);

      return posts.slice(0, limit);
    } catch (error) {
      console.error('Error getting trending posts:', error);
      throw error;
    }
  }

  /**
   * Lấy popular tags
   */
  async getPopularTags(limit: number = 20): Promise<{ tag: string; count: number }[]> {
    try {
      const postsRef = ref(db, this.POSTS_PATH);
      const snapshot = await get(postsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const posts = Object.values(snapshot.val()) as BlogPost[];
      const tagCounts: { [key: string]: number } = {};

      // Đếm số lượng posts cho mỗi tag
      posts.forEach(post => {
        if (post.status === BlogPostStatus.PUBLISHED && post.isPublic && post.tags) {
          post.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      // Chuyển thành array và sort
      const popularTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return popularTags;
    } catch (error) {
      console.error('Error getting popular tags:', error);
      throw error;
    }
  }

  /**
   * Lấy related posts (posts cùng category hoặc có tags tương tự)
   */
  async getRelatedPosts(postId: string, limit: number = 5): Promise<BlogPost[]> {
    try {
      // Lấy thông tin post hiện tại
      const postRef = ref(db, `${this.POSTS_PATH}/${postId}`);
      const postSnapshot = await get(postRef);
      
      if (!postSnapshot.exists()) {
        return [];
      }

      const currentPost = postSnapshot.val() as BlogPost;
      
      // Lấy tất cả posts
      const postsRef = ref(db, this.POSTS_PATH);
      const allPostsSnapshot = await get(postsRef);
      
      if (!allPostsSnapshot.exists()) {
        return [];
      }

      let posts = Object.entries(allPostsSnapshot.val()).map(([id, post]) => ({
        id,
        ...post as BlogPost
      }));

      // Filter posts (loại bỏ post hiện tại và chỉ lấy published posts)
      posts = posts.filter(post => 
        post.id !== postId && 
        post.status === BlogPostStatus.PUBLISHED &&
        post.isPublic
      );

      // Tính relevance score
      posts = posts.map(post => {
        let score = 0;
        
        // Tags chung: +2 điểm cho mỗi tag
        if (currentPost.tags && post.tags) {
          const commonTags = currentPost.tags.filter(tag => post.tags!.includes(tag));
          score += commonTags.length * 2;
        }
        
        // Cùng author: +5 điểm
        if (post.authorId === currentPost.authorId) {
          score += 5;
        }

        return { ...post, relevanceScore: score };
      });

      // Sort theo relevance score và created date
      posts.sort((a, b) => {
        const scoreA = (a as any).relevanceScore;
        const scoreB = (b as any).relevanceScore;
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return b.createdAt - a.createdAt;
      });

      return posts.slice(0, limit);
    } catch (error) {
      console.error('Error getting related posts:', error);
      throw error;
    }
  }

  /**
   * Sort posts theo criteria
   */
  private sortPosts(posts: BlogPost[], sortBy: BlogSortBy): BlogPost[] {
    switch (sortBy) {
      case BlogSortBy.CREATED_ASC:
        return posts.sort((a, b) => a.createdAt - b.createdAt);
      case BlogSortBy.CREATED_DESC:
        return posts.sort((a, b) => b.createdAt - a.createdAt);
      case BlogSortBy.UPDATED_ASC:
        return posts.sort((a, b) => a.updatedAt - b.updatedAt);
      case BlogSortBy.UPDATED_DESC:
        return posts.sort((a, b) => b.updatedAt - a.updatedAt);
      case BlogSortBy.TITLE_ASC:
        return posts.sort((a, b) => a.title.localeCompare(b.title));
      case BlogSortBy.TITLE_DESC:
        return posts.sort((a, b) => b.title.localeCompare(a.title));
      case BlogSortBy.VIEWS_ASC:
        return posts.sort((a, b) => (a.viewCount || 0) - (b.viewCount || 0));
      case BlogSortBy.VIEWS_DESC:
        return posts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      case BlogSortBy.LIKES_ASC:
        return posts.sort((a, b) => (a.likeCount || 0) - (b.likeCount || 0));
      case BlogSortBy.LIKES_DESC:
        return posts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      default:
        return posts.sort((a, b) => b.createdAt - a.createdAt);
    }
  }
}

export default new SearchService();