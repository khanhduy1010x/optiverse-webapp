import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogPostDetail, CommentSection, BlogSidebar, ReportModal } from '../../components/blog';
import { useBlog, useComments, useLikes, useReports } from '../../hooks/blog';
import { useAuthState } from "../../hooks/useAuthState.hook";
import { useAuthStatus } from '../../hooks/auth/useAuthStatus.hook';
import { BlogPostWithAuthor } from '../../types/blog/blog.types';

const BlogPostPage: React.FC = () => {
  const { id: postId } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chỉ hiển thị lỗi khi thực sự có lỗi hoặc đã tải xong nhưng không có post
  if (postError || (!postLoading && !post)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Không tìm thấy bài viết
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {postError || 'Bài viết này có thể đã bị xóa hoặc không tồn tại.'}
            </p>
            <button
              onClick={() => navigate('/blog')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/blog')}
                className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Blog
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                  {post.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>

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
              currentUserId={user?.user_id}
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