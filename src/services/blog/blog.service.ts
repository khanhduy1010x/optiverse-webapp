import { ref, push, update, remove, get, query, orderByChild, equalTo, limitToLast, startAt, endAt } from 'firebase/database';
import { db } from '../../firebase';
import api from '../api.service';
import LikeService from './like.service';
import { 
  BlogPost, 
  BlogPostWithAuthor, 
  BlogAuthor,
  BlogSearchFilters,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogPostsResponse,
  BlogPostResponse,
  BlogSearchResponse,
  BlogUploadImageResponse
} from '../../types/blog';
import { ApiResponse } from '../../types/api/api.interface';

class BlogService {
  private readonly POSTS_PATH = 'blogPosts';
  private readonly VIEWS_PATH = 'blogViews';
  private readonly LIKES_PATH = 'blogLikes';
  private readonly BOOKMARKS_PATH = 'blogBookmarks';

  /**
   * Tạo blog post mới
   */
  async createPost(postData: CreateBlogPostRequest): Promise<BlogPostWithAuthor> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const postRef = push(ref(db, this.POSTS_PATH));
      const postId = postRef.key!;

      // Clean HTML content before saving
      const cleanContent = this.cleanHtmlContent(postData.content);
      
      const timestamp = Date.now();
      const isPublished = !postData.isDraft && postData.isPublic;
      
      const newPost: BlogPost = {
        id: postId,
        title: postData.title,
        content: cleanContent,
        excerpt: postData.excerpt,
        authorId: userId,
        tags: postData.tags || [],
        images: postData.images || [],
        isPublic: postData.isPublic,
        isDraft: postData.isDraft,
        metaTitle: postData.metaTitle || postData.title,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        bookmarkCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...(isPublished && { publishedAt: timestamp })
      };

      // Remove undefined values before updating Firebase
      const cleanPost = Object.fromEntries(
        Object.entries(newPost).filter(([_, v]) => v !== undefined)
      );

      await update(postRef, cleanPost);
      
      // Lấy thông tin author
      const authorInfo = await this.getAuthorInfo(userId);
      
      return {
        ...newPost,
        author: authorInfo
      } as BlogPostWithAuthor;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  /**
   * Cập nhật blog post
   */
  async updatePost(postId: string, postData: UpdateBlogPostRequest): Promise<BlogPost> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const postRef = ref(db, `${this.POSTS_PATH}/${postId}`);
      const snapshot = await get(postRef);
      
      if (!snapshot.exists()) {
        throw new Error('Post not found');
      }

      const existingPost = snapshot.val() as BlogPost;
      
      // Kiểm tra quyền sở hữu
      if (existingPost.authorId !== userId) {
        throw new Error('You do not have permission to edit this post');
      }



      const updatedPost: Partial<BlogPost> = {
        ...postData,
        updatedAt: Date.now(),
        publishedAt: postData.status === 'published' && existingPost.status !== 'published' 
          ? Date.now() 
          : existingPost.publishedAt
      };

      await update(postRef, updatedPost);
      
      const updatedSnapshot = await get(postRef);
      return updatedSnapshot.val() as BlogPost;
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  /**
   * Xóa blog post
   */
  async deletePost(postId: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      console.log('🗑️ Delete Post - User ID:', userId);

      const postRef = ref(db, `${this.POSTS_PATH}/${postId}`);
      const snapshot = await get(postRef);
      
      if (!snapshot.exists()) {
        throw new Error('Post not found');
      }

      const post = snapshot.val() as BlogPost;
      console.log('📝 Delete Post - Post Author ID:', post.authorId);
      
      // Kiểm tra quyền: Admin hoặc tác giả có thể xóa
      // Lấy role từ user object trong localStorage
      let isAdmin = false;
      try {
        const userStr = localStorage.getItem('user');
        console.log('👤 Delete Post - User string from localStorage:', userStr);
        
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('👤 Delete Post - Parsed user:', user);
          console.log('👤 Delete Post - User role:', user.role);
          isAdmin = user.role === 'admin';
        }
        
        // Fallback: check Redux store format
        if (!isAdmin) {
          const persistRoot = localStorage.getItem('persist:root');
          if (persistRoot) {
            const root = JSON.parse(persistRoot);
            if (root.auth) {
              const auth = JSON.parse(root.auth);
              console.log('👤 Delete Post - Auth from persist:root:', auth);
              if (auth.user && auth.user.role === 'admin') {
                isAdmin = true;
              }
            }
          }
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
      
      console.log('🔐 Delete Post - isAdmin:', isAdmin);
      
      const isAuthor = post.authorId === userId;
      console.log('✍️ Delete Post - isAuthor:', isAuthor);
      
      if (!isAdmin && !isAuthor) {
        throw new Error('You do not have permission to delete this post');
      }

      await remove(postRef);
      
      // Xóa các dữ liệu liên quan
      await this.cleanupPostData(postId);
      
      return true;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }

  /**
   * Lấy blog post theo ID
   */
  async getPostById(postId: string): Promise<BlogPostWithAuthor | null> {
    try {
      const postRef = ref(db, `${this.POSTS_PATH}/${postId}`);
      const snapshot = await get(postRef);
      
      if (snapshot.exists()) {
        const post = snapshot.val() as BlogPost;
        const [authorInfo, isLiked] = await Promise.all([
          this.getAuthorInfo(post.authorId),
          LikeService.isPostLiked(post.id)
        ]);
        
        return {
          ...post,
          author: authorInfo,
          isLiked
        } as BlogPostWithAuthor;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting blog post:', error);
      throw error;
    }
  }



  /**
   * Lấy danh sách blog posts với phân trang
   */
  async getPosts(filters: BlogSearchFilters = {}, limit: number = 10, offset: number = 0): Promise<BlogPostWithAuthor[]> {
    try {
      const postsRef = ref(db, this.POSTS_PATH);
      let postsQuery = query(postsRef);

      // Áp dụng filters (tạm thời bỏ query theo status để tránh lỗi index)
      if (filters.authorId) {
        postsQuery = query(postsRef, orderByChild('authorId'), equalTo(filters.authorId));
      } else {
        // Lấy tất cả posts, sẽ filter theo status sau
        postsQuery = query(postsRef);
      }

      const snapshot = await get(postsQuery);
      
      if (!snapshot.exists()) {
        return [];
      }

      const posts = snapshot.val();
      let postsArray = Object.values(posts) as BlogPost[];

      // ✅ FIX: Loại bỏ workspace blog posts khỏi blog global
      // Chỉ lấy posts KHÔNG có workspaceId (tức là blog posts công khai)
      postsArray = postsArray.filter(post => !post.workspaceId);

      // Lọc theo status (mặc định chỉ lấy published posts)
      const statusFilter = filters.status || 'published';
      postsArray = postsArray.filter(post => post.status === statusFilter);

      // Lọc thêm theo tags nếu có
      if (filters.tags && filters.tags.length > 0) {
        postsArray = postsArray.filter(post => 
          post.tags && post.tags.some(tag => filters.tags!.includes(tag))
        );
      }

      // Lọc theo visibility
      if (filters.visibility) {
        postsArray = postsArray.filter(post => post.visibility === filters.visibility);
      }

      // Sắp xếp
      postsArray.sort((a, b) => {
        switch (filters.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'views':
            return (b.viewCount || 0) - (a.viewCount || 0);
          case 'likes':
            return (b.likeCount || 0) - (a.likeCount || 0);
          case 'popular':
            // Tính điểm phổ biến: Views (1x) + Likes (2x) + Comments (3x)
            const scoreA = (a.viewCount || 0) * 1 + (a.likeCount || 0) * 2 + (a.commentCount || 0) * 3;
            const scoreB = (b.viewCount || 0) * 1 + (b.likeCount || 0) * 2 + (b.commentCount || 0) * 3;
            return scoreB - scoreA;
          default: // 'newest'
            return (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt);
        }
      });

      // Phân trang
      const paginatedPosts = postsArray.slice(offset, offset + limit);

      // Lấy thông tin author và trạng thái like cho mỗi post
      const postsWithAuthor = await Promise.all(
        paginatedPosts.map(async (post) => {
          const [authorInfo, isLiked] = await Promise.all([
            this.getAuthorInfo(post.authorId),
            LikeService.isPostLiked(post.id)
          ]);
          return {
            ...post,
            author: authorInfo,
            isLiked
          } as BlogPostWithAuthor;
        })
      );

      return postsWithAuthor;
    } catch (error) {
      console.error('Error getting blog posts:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm blog posts
   */
  async searchPosts(searchQuery: string, filters: BlogSearchFilters = {}, searchType: string = 'all'): Promise<BlogPostWithAuthor[]> {
    try {
      // Lấy tất cả posts trước
      const allPosts = await this.getPosts(filters, 1000, 0);
      
      // Tìm kiếm theo loại được chọn
      const searchResults = allPosts.filter(post => {
        const searchTerm = searchQuery.toLowerCase();
        
        switch (searchType) {
          case 'title':
            return post.title.toLowerCase().includes(searchTerm);
          
          case 'author':
            return (
              post.author?.name?.toLowerCase().includes(searchTerm) ||
              post.author?.displayName?.toLowerCase().includes(searchTerm)
            );
          
          case 'content':
            return (
              post.content.toLowerCase().includes(searchTerm) ||
              post.excerpt?.toLowerCase().includes(searchTerm)
            );
          
          case 'tags':
            return post.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
          
          case 'all':
          default:
            return (
              post.title.toLowerCase().includes(searchTerm) ||
              post.content.toLowerCase().includes(searchTerm) ||
              post.excerpt?.toLowerCase().includes(searchTerm) ||
              post.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
              post.author?.name?.toLowerCase().includes(searchTerm) ||
              post.author?.displayName?.toLowerCase().includes(searchTerm)
            );
        }
      });

      return searchResults;
    } catch (error) {
      console.error('Error searching blog posts:', error);
      throw error;
    }
  }

  /**
   * Tăng view count cho post
   */
  async incrementViewCount(postId: string): Promise<void> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return;

      const viewRef = ref(db, `${this.VIEWS_PATH}/${postId}/${userId}`);
      const viewSnapshot = await get(viewRef);
      
      const postRef = ref(db, `${this.POSTS_PATH}/${postId}`);
      
      if (!viewSnapshot.exists()) {
        // Lần đầu xem
        await update(viewRef, {
          postId,
          userId,
          viewCount: 1,
          lastViewedAt: Date.now(),
          createdAt: Date.now()
        });

        // Tăng view count của post
        const postSnapshot = await get(postRef);
        if (postSnapshot.exists()) {
          const post = postSnapshot.val() as BlogPost;
          await update(postRef, {
            viewCount: (post.viewCount || 0) + 1
          });
        }
      } else {
        // Cập nhật lần xem cuối
        const viewData = viewSnapshot.val();
        await update(viewRef, {
          viewCount: viewData.viewCount + 1,
          lastViewedAt: Date.now()
        });
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  /**
   * Upload hình ảnh cho blog
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const formData = new FormData();
      formData.append('file', file);

      // Sử dụng endpoint của chat để upload ảnh
      const response = await api.post<ApiResponse<string>>(
        '/core/profile/chat/theme',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error uploading blog image:', error);
      throw new Error('Không thể tải lên hình ảnh. Vui lòng thử lại.');
    }
  }

  /**
   * Kiểm tra slug đã tồn tại chưa
   */


  /**
   * Clean HTML content
   */
  private cleanHtmlContent(content: string): string {
    // Remove HTML tags and convert to plain text
    return content
      .replace(/<p>/g, '\n\n')
      .replace(/<\/p>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }



  /**
   * Lấy thông tin author (public method for hooks)
   */
  async getAuthorInfo(authorId: string): Promise<BlogAuthor | null> {
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
      return null;
    } catch (error) {
      console.error('Error getting author info:', error);
      return null;
    }
  }

  /**
   * Lấy bài viết phổ biến theo công thức: Views (1x) + Likes (2x) + Comments (3x)
   */
  async getPopularPosts(limit: number = 5): Promise<BlogPostWithAuthor[]> {
    try {
      console.log('🔍 Fetching popular posts from Firebase...');
      const postsRef = ref(db, this.POSTS_PATH);
      const snapshot = await get(postsRef);
      
      if (!snapshot.exists()) {
        console.log('⚠️ No posts found in Firebase');
        return [];
      }

      const allPosts = snapshot.val();
      console.log(`📚 Total posts in Firebase: ${Object.keys(allPosts).length}`);

      const posts: BlogPostWithAuthor[] = [];
      
      // Lấy tất cả posts và tính điểm phổ biến
      for (const [postId, postData] of Object.entries(allPosts)) {
        const post = { ...postData, id: postId } as BlogPost;
        
        // Chỉ lấy blog chính (không lấy workspace blog)
        if (post.workspaceId) {
          console.log(`  ⏭️  Skip workspace post: "${post.title}"`);
          continue;
        }

        // Tính điểm phổ biến: Views (1x) + Likes (2x) + Comments (3x)
        const popularityScore = (post.viewCount || 0) * 1 + 
                               (post.likeCount || 0) * 2 + 
                               (post.commentCount || 0) * 3;

        console.log(`  📝 "${post.title}" - Score: ${popularityScore} (V:${post.viewCount || 0}, L:${post.likeCount || 0}, C:${post.commentCount || 0})`);

        // Lấy thông tin author
        const authorInfo = await this.getAuthorInfo(post.authorId);
        
        posts.push({
          ...post,
          author: authorInfo,
          popularityScore // Thêm điểm phổ biến để sort
        } as BlogPostWithAuthor & { popularityScore: number });
      }

      console.log(`📊 Total posts with interactions: ${posts.length}`);

      // Sắp xếp theo điểm phổ biến giảm dần và lấy top posts
      const topPosts = posts
        .sort((a: any, b: any) => b.popularityScore - a.popularityScore)
        .slice(0, limit)
        .map(({ popularityScore, ...post }) => {
          console.log(`  #${posts.indexOf({ ...post, popularityScore } as any) + 1}: "${post.title}" - Score: ${popularityScore} (Views: ${post.viewCount}, Likes: ${post.likeCount}, Comments: ${post.commentCount})`);
          return post;
        });
      
      console.log(`✅ Returning top ${topPosts.length} popular posts`);
      return topPosts;
        
    } catch (error) {
      console.error('Error getting popular posts:', error);
      return [];
    }
  }

  /**
   * Dọn dẹp dữ liệu liên quan khi xóa post
   */
  private async cleanupPostData(postId: string): Promise<void> {
    try {
      // Xóa views
      const viewsRef = ref(db, `${this.VIEWS_PATH}/${postId}`);
      await remove(viewsRef);

      // Xóa likes
      const likesRef = ref(db, `${this.LIKES_PATH}/${postId}`);
      await remove(likesRef);

      // Xóa bookmarks (cần duyệt qua tất cả users)
      // Có thể implement sau nếu cần thiết
    } catch (error) {
      console.error('Error cleaning up post data:', error);
    }
  }

  /**
   * ========================================
   * WORKSPACE BLOG INTEGRATION
   * ========================================
   */

  /**
   * Tạo workspace blog post
   */
  async createWorkspaceBlogPost(
    workspaceId: string,
    postData: CreateBlogPostRequest
  ): Promise<BlogPostWithAuthor> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      const postRef = push(ref(db, this.POSTS_PATH));
      const postId = postRef.key!;

      const cleanContent = this.cleanHtmlContent(postData.content);
      
      const timestamp = Date.now();
      const isPublished = !postData.isDraft && postData.isPublic;
      
      const newPost: BlogPost = {
        id: postId,
        title: postData.title,
        content: cleanContent,
        excerpt: postData.excerpt,
        authorId: userId,
        tags: postData.tags || [],
        images: postData.images || [],
        isPublic: postData.isPublic,
        isDraft: postData.isDraft,
        metaTitle: postData.metaTitle || postData.title,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        bookmarkCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...(isPublished && { publishedAt: timestamp }), // Only add publishedAt if published
        
        // Workspace Integration
        workspaceId: workspaceId
      };

      // Remove undefined values before updating Firebase
      const cleanPost = Object.fromEntries(
        Object.entries(newPost).filter(([_, v]) => v !== undefined)
      );

      await update(postRef, cleanPost);
      
      const authorInfo = await this.getAuthorInfo(userId);
      
      return {
        ...newPost,
        author: authorInfo
      } as BlogPostWithAuthor;
    } catch (error) {
      console.error('Error creating workspace blog post:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả blog posts của workspace
   */
  async getWorkspaceBlogPosts(workspaceId: string): Promise<BlogPostWithAuthor[]> {
    try {
      const postsRef = ref(db, this.POSTS_PATH);
      const snapshot = await get(postsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const allPosts = snapshot.val();
      
      // Filter posts by workspaceId
      const workspacePosts = Object.entries(allPosts)
        .filter(([_, post]: [string, any]) => post.workspaceId === workspaceId)
        .map(([id, post]: [string, any]) => ({
          ...post,
          id
        })) as BlogPost[];

      // Get author info for all posts
      const postsWithAuthors = await Promise.all(
        workspacePosts.map(async (post) => {
          const authorInfo = await this.getAuthorInfo(post.authorId);
          return {
            ...post,
            author: authorInfo
          } as BlogPostWithAuthor;
        })
      );

      // Sort by createdAt desc
      return postsWithAuthors.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting workspace blog posts:', error);
      throw error;
    }
  }

  /**
   * Check if workspace blog exists (có ít nhất 1 post)
   */
  async checkWorkspaceBlogExists(workspaceId: string): Promise<boolean> {
    try {
      const posts = await this.getWorkspaceBlogPosts(workspaceId);
      return posts.length > 0;
    } catch (error) {
      console.error('Error checking workspace blog:', error);
      return false;
    }
  }
}

export default new BlogService();