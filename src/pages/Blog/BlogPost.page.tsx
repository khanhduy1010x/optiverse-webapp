import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogPostDetail, CommentSection, BlogSidebar, ReportModal } from '../../components/blog';
import { useBlog, useComments, useLikes, useReports } from '../../hooks/blog';
import { useAuthState } from "../../hooks/useAuthState.hook";
import { useAuthStatus } from '../../hooks/auth/useAuthStatus.hook';
import { BlogPostWithAuthor } from '../../types/blog/blog.types';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const BlogPostPage: React.FC = () => {
  const { id: postId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useAppTranslate('blog');
  const [post, setPost] = useState<BlogPostWithAuthor | null>(null);
  const [popularPosts, setPopularPosts] = useState<BlogPostWithAuthor[]>([]);

  // Authentication
  const { user } = useAuthState();
  const { isAdmin } = useAuthStatus();

  const {
    fetchPostById,
    deletePost,
    isLoading: postLoading,
    error: postError,
    fetchPopularPosts
  } = useBlog();

  const {
    comments,
    commentsLoading,
    commentsError,
    fetchComments,
    createComment,
    updateCommentById,
    deleteComment,
    toggleCommentLike
  } = useComments();

  const {
    togglePostLike,
    togglePostBookmark,
    checkPostInteractionStatus
  } = useLikes();

  const { createReport } = useReports();

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState('');
  const [reportPostTitle, setReportPostTitle] = useState('');

  useEffect(() => {
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

    if (postId) {
      loadPost();
      fetchComments(postId);
    }
    
    // Fetch popular posts
    loadPopularPosts();
  }, [postId]);

  const loadPopularPosts = async () => {
    try {
      const popular = await fetchPopularPosts(5);
      setPopularPosts(popular);
    } catch (error) {
      console.error('Error fetching popular posts:', error);
    }
  };

  const loadPost = async () => {
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1")

    if (!postId) return;
console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    try {
      const postData = await fetchPostById(postId);
      if (postData) {
        setPost(postData);
        setLikeCount(postData.likeCount || 0);



        // Check like and bookmark status
        const { isLiked: likeStatus, isBookmarked: bookmarkStatus } = await checkPostInteractionStatus(postId);
        setIsLiked(likeStatus);
        setIsBookmarked(bookmarkStatus);
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    }
  };

  const handleLike = async () => {
    if (!postId) return;

    try {
      await togglePostLike(postId);
      // Reload post data để cập nhật like status
      await loadPost();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!postId) return;

    try {
      await togglePostBookmark(postId);
      // Reload post data để cập nhật bookmark status
      await loadPost();
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const handleCommentSubmit = async (content: string, parentId?: string) => {
    if (!postId) return;

    try {
      await createComment({
        postId,
        content,
        parentId
      });
      // Refresh comments
      fetchComments(postId);
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  };

  const handleCommentEdit = async (commentId: string, content: string) => {
    try {
      await updateCommentById(commentId, { content });
      // Refresh comments
      if (postId) {
        fetchComments(postId);
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
      throw error;
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      // Refresh comments
      if (postId) {
        fetchComments(postId);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      await toggleCommentLike(commentId);
      // Refresh comments to get updated like counts
      if (postId) {
        fetchComments(postId);
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleRelatedPostClick = (relatedPostId: string) => {
    navigate(`/blog/post/${relatedPostId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/blog/category/${categoryId}`);
  };

  const handleTagClick = (tagName: string) => {
    navigate(`/blog?search=${encodeURIComponent(tagName)}`);
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

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      // Chuyển hướng về trang blog sau khi xóa thành công
      navigate('/blog');
    } catch (error) {
      console.error('Error deleting post:', error);
      // Có thể thêm toast notification lỗi ở đây
    }
  };

  // Hiển thị loading khi đang tải hoặc khi chưa có post (tránh flash "không tìm thấy")
  if (postLoading || (!post && !postError)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/60 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-white/60 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-white/60 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-white/60 rounded"></div>
              <div className="h-4 bg-white/60 rounded w-5/6"></div>
              <div className="h-4 bg-white/60 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chỉ hiển thị lỗi khi thực sự có lỗi hoặc đã tải xong nhưng không có post
  if (postError || (!postLoading && !post)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Không tìm thấy bài viết
            </h3>
            <p className="text-gray-600 mb-6">
              {postError || 'Bài viết này có thể đã bị xóa hoặc không tồn tại.'}
            </p>
            <button
              onClick={() => navigate('/blog')}
              className="px-8 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #21b4ca 0%, #1e90ff 100%)',
              }}
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-cyan-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <BlogPostDetail
              post={{
                ...post,
                isLiked,
                isBookmarked,
                likeCount
              }}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onReport={handleReport}
              onDelete={handleDelete}
              onCategoryClick={handleCategoryClick}
              onTagClick={handleTagClick}
              isAdmin={isAdmin}
              currentUserId={user?._id || user?.user_id}
            />

            {/* Comments Section */}
            <div className="mt-12">
              <CommentSection
                postId={postId!}
                comments={comments}
                postAuthorId={post.authorId}
                loading={commentsLoading}
                onAddComment={handleCommentSubmit}
                onEditComment={handleCommentEdit}
                onDeleteComment={handleCommentDelete}
                onLikeComment={handleCommentLike}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar
              popularPosts={popularPosts}
              onPostClick={handleRelatedPostClick}
              onCategoryClick={handleCategoryClick}
              onTagClick={handleTagClick}
            />
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

export default BlogPostPage;