import { ref, push, get, update } from 'firebase/database';
import { db } from '../../firebase';
import { BlogReport, CreateReportRequest, ReportStatus, ReportWithPost } from '../../types/blog/report.types';
import { BlogPost, BlogAuthor } from '../../types/blog/blog.types';
import api from '../api.service';
import { ApiResponse } from '../../types/api/api.interface';

class ReportService {
  private readonly REPORTS_PATH = 'blogReports';
  private readonly POSTS_PATH = 'blogPosts';

  /**
   * Tạo báo cáo mới
   */
  async createReport(reportData: CreateReportRequest): Promise<BlogReport> {
    try {
      const userId = localStorage.getItem('user_id');
      const userName = localStorage.getItem('user_name') || localStorage.getItem('full_name') || 'Anonymous';
      const userEmail = localStorage.getItem('user_email') || '';

      if (!userId) {
        throw new Error('User not logged in');
      }

      // Lấy thông tin bài viết
      const postRef = ref(db, `${this.POSTS_PATH}/${reportData.postId}`);
      const postSnapshot = await get(postRef);
      
      if (!postSnapshot.exists()) {
        throw new Error('Post not found');
      }

      const post = postSnapshot.val() as BlogPost;

      // Kiểm tra xem user đã report bài viết này chưa
      // Lấy tất cả reports và filter ở client để tránh cần index
      const allReportsSnapshot = await get(ref(db, this.REPORTS_PATH));
      if (allReportsSnapshot.exists()) {
        const reports = allReportsSnapshot.val();
        const hasReported = Object.values(reports).some((report: any) => 
          report.postId === reportData.postId && report.reporterId === userId
        );
        if (hasReported) {
          throw new Error('Bạn đã tố cáo bài viết này rồi');
        }
      }

      const newReport: Omit<BlogReport, 'id'> = {
        postId: reportData.postId,
        postTitle: post.title,
        postAuthorId: post.authorId,
        reporterId: userId,
        reporterName: userName,
        reporterEmail: userEmail,
        reason: reportData.reason,
        reasonText: this.getReasonText(reportData.reason),
        description: reportData.description || '',
        createdAt: Date.now(),
        status: ReportStatus.PENDING
      };

      const reportsRef = ref(db, this.REPORTS_PATH);
      const newReportRef = await push(reportsRef, newReport);
      
      const reportId = newReportRef.key!;
      
      return {
        id: reportId,
        ...newReport
      };
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả báo cáo (chỉ admin)
   */
  async getAllReports(): Promise<ReportWithPost[]> {
    try {
      const reportsRef = ref(db, this.REPORTS_PATH);
      const reportsSnapshot = await get(reportsRef);
      
      if (!reportsSnapshot.exists()) {
        return [];
      }

      const reports = Object.entries(reportsSnapshot.val()).map(([id, report]) => ({
        id,
        ...report as BlogReport
      }));

      // Lấy thông tin bài viết cho mỗi report
      const reportsWithPost: ReportWithPost[] = [];
      
      for (const report of reports) {
        try {
          const postRef = ref(db, `${this.POSTS_PATH}/${report.postId}`);
          const postSnapshot = await get(postRef);
          
          // Lấy thông tin người tố cáo thực tế từ API
          const reporterInfo = await this.getAuthorInfo(report.reporterId) || this.getFallbackAuthorInfo(report.reporterId);
          
          if (postSnapshot.exists()) {
            const post = postSnapshot.val() as BlogPost;
            // Lấy thông tin tác giả thực tế từ API
            const authorInfo = await this.getAuthorInfo(post.authorId) || this.getFallbackAuthorInfo(post.authorId);
            
            reportsWithPost.push({
              ...report,
              post: {
                id: report.postId,
                title: post.title,
                content: post.content,
                authorId: post.authorId,
                authorName: authorInfo.displayName || authorInfo.name || 'Unknown',
                author: authorInfo,
                createdAt: post.createdAt
              },
              reporter: reporterInfo
            });
          } else {
            // Bài viết đã bị xóa
            const fallbackAuthor = this.getFallbackAuthorInfo(report.postAuthorId);
            reportsWithPost.push({
              ...report,
              post: {
                id: report.postId,
                title: '[Bài viết đã bị xóa]',
                content: '',
                authorId: report.postAuthorId,
                authorName: fallbackAuthor.displayName || fallbackAuthor.name || 'Unknown',
                author: fallbackAuthor,
                createdAt: 0
              },
              reporter: reporterInfo
            });
          }
        } catch (error) {
          console.error(`Error fetching post ${report.postId}:`, error);
          reportsWithPost.push(report);
        }
      }

      // Sắp xếp theo thời gian tạo (mới nhất trước)
      return reportsWithPost.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Lấy báo cáo theo ID
   */
  async getReportById(reportId: string): Promise<BlogReport | null> {
    try {
      const reportRef = ref(db, `${this.REPORTS_PATH}/${reportId}`);
      const reportSnapshot = await get(reportRef);
      
      if (!reportSnapshot.exists()) {
        return null;
      }

      return {
        id: reportId,
        ...reportSnapshot.val() as BlogReport
      };
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái báo cáo
   */
  async updateReportStatus(reportId: string, status: ReportStatus): Promise<void> {
    try {
      const reportRef = ref(db, `${this.REPORTS_PATH}/${reportId}`);
      await update(reportRef, { status });
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }

  /**
   * Lấy text mô tả cho lý do báo cáo
   */
  private getReasonText(reason: string): string {
    const reasonMap: Record<string, string> = {
      'inappropriate_content': 'Nội dung không phù hợp',
      'spam': 'Spam',
      'copyright_violation': 'Vi phạm bản quyền',
      'harassment': 'Quấy rối',
      'misinformation': 'Thông tin sai lệch',
      'violence': 'Bạo lực',
      'hate_speech': 'Ngôn từ thù địch',
      'other': 'Khác'
    };
    
    return reasonMap[reason] || 'Khác';
  }

  /**
   * Kiểm tra xem user đã report bài viết này chưa
   */
  async hasUserReportedPost(postId: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return false;

      // Lấy tất cả reports và filter ở client để tránh cần index
      const allReportsSnapshot = await get(ref(db, this.REPORTS_PATH));
      if (allReportsSnapshot.exists()) {
        const reports = allReportsSnapshot.val();
        return Object.values(reports).some((report: any) => 
          report.postId === postId && report.reporterId === userId
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking user report:', error);
      return false;
    }
  }

  /**
   * Lấy thông tin author từ API
   */
  private async getAuthorInfo(authorId: string): Promise<BlogAuthor | null> {
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
   * Lấy thông tin author fallback từ localStorage
   */
  private getFallbackAuthorInfo(authorId: string): BlogAuthor {
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

export default new ReportService();