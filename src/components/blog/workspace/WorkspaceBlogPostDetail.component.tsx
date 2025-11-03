import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogPostDetail from '../BlogPostDetail.component';
import CommentSection from '../CommentSection.component';
import { BlogPostWithAuthor, BlogCommentWithAuthor } from '../../../types/blog';
import blogService from '../../../services/blog/blog.service';
import { useAuthState } from '../../../hooks/useAuthState.hook';
import { useAuthStatus } from '../../../hooks/auth/useAuthStatus.hook';
import { useLikes, useReports, useComments } from '../../../hooks/blog';

/**
 * Workspace Blog Post Detail Component
 * Wrapper để fetch workspace blog post và reuse 100% BlogPostDetail component
 */
interface WorkspaceBlogPostDetailProps {
  workspaceId: string;
  postId: string;
  onBack?: () => void;
  onEdit?: () => void;
}

const WorkspaceBlogPostDetail: React.FC<WorkspaceBlogPostDetailProps> = ({
  workspaceId,
  postId,
  onBack,
  onEdit
}) => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { isAdmin } = useAuthStatus();
  const { togglePostLike } = useLikes();
  const { createReport } = useReports();
  
  // ✅ Use comments hook
  const {
    comments,
    commentsLoading,
    commentsError,
    createComment,
    updateCommentById,
    deleteComment,
    toggleCommentLike,
    fetchComments
  } = useComments(postId || '');

  const [post, setPost] = useState<BlogPostWithAuthor | null>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workspace blog post
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch workspace info
        const workspaceService = (await import('../../../services/workspace.service')).default;
        const workspaceData = await workspaceService.getWorkspaceById(workspaceId);
        setWorkspace(workspaceData);

        // Fetch post từ Firebase
        const postData = await blogService.getPostById(postId);

        // ✅ Verify post belongs to workspace
        if (!postData || postData.workspaceId !== workspaceId) {
          setError('Post not found in this workspace');
          setLoading(false);
          return;
        }

        setPost(postData);
        console.log('✅ Workspace blog post loaded:', postData.title);

        // ✅ Check bookmark status from localStorage
        if (user) {
          const bookmarksKey = `bookmarks_${user.user_id}`;
          const bookmarksStr = localStorage.getItem(bookmarksKey) || '[]';
          const bookmarks: string[] = JSON.parse(bookmarksStr);
          postData.isBookmarked = bookmarks.includes(postId);
        }

        // ✅ Increment view count
        await blogService.incrementViewCount(postId);
        console.log('✅ View count incremented');
      } catch (err: any) {
        console.error('❌ Error loading workspace blog post:', err);
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, workspaceId, user]);

  // Handlers - Reuse 100% từ BlogHomePage
  const handleLike = async (postId: string) => {
    if (!user) {
      alert('Please login to like posts');
      return;
    }

    try {
      await togglePostLike(postId);
      // Reload post để update like count
      const updatedPost = await blogService.getPostById(postId);
      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user) {
      alert('Please login to bookmark posts');
      return;
    }

    try {
      // Simple localStorage bookmark implementation
      const bookmarksKey = `bookmarks_${user.user_id}`;
      const bookmarksStr = localStorage.getItem(bookmarksKey) || '[]';
      const bookmarks: string[] = JSON.parse(bookmarksStr);
      
      const isBookmarked = bookmarks.includes(postId);
      
      if (isBookmarked) {
        // Remove bookmark
        const updatedBookmarks = bookmarks.filter(id => id !== postId);
        localStorage.setItem(bookmarksKey, JSON.stringify(updatedBookmarks));
        alert('Removed from bookmarks');
      } else {
        // Add bookmark
        bookmarks.push(postId);
        localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
        alert('Added to bookmarks');
      }

      // Reload post để update bookmark status
      const updatedPost = await blogService.getPostById(postId);
      if (updatedPost) {
        // Check bookmark status
        const currentBookmarksStr = localStorage.getItem(bookmarksKey) || '[]';
        const currentBookmarks: string[] = JSON.parse(currentBookmarksStr);
        updatedPost.isBookmarked = currentBookmarks.includes(postId);
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
      alert('Failed to bookmark post');
    }
  };

  const handleShare = (post: BlogPostWithAuthor) => {
    const url = `${window.location.origin}/workspace/${workspaceId}/blog/post/${post.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt || post.title,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleReport = async (postId: string, postTitle: string) => {
    if (!user) {
      alert('Please login to report posts');
      return;
    }

    const reason = prompt('Why are you reporting this post?');
    if (!reason) return;

    const description = prompt('Additional details (optional):') || '';

    try {
      await createReport({
        postId,
        reason: reason as any, // TODO: Fix type
        description
      });
      alert('Report submitted successfully');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      return;
    }

    try {
      await blogService.deletePost(postId);
      alert('Đã xóa bài viết thành công');
      onBack?.();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Không thể xóa bài viết');
    }
  };

  const handleTagClick = (tag: string) => {
    // Navigate to workspace blog with tag filter
    navigate(`/workspace/${workspaceId}/blog?tag=${encodeURIComponent(tag)}`);
  };

  // ✅ Comment handlers - Wrapper để match CommentSection interface
  const handleAddComment = async (content: string, parentId?: string) => {
    if (!user) {
      alert('Please login to comment');
      return;
    }

    try {
      await createComment({
        postId: postId,
        content,
        parentId
      });
      // Refresh comments
      await fetchComments(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      await updateCommentById(commentId, { content });
      // Refresh comments
      await fetchComments(postId);
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      // Refresh comments
      await fetchComments(postId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      alert('Please login to like comments');
      return;
    }

    try {
      await toggleCommentLike(commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The post you are looking for does not exist'}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    );
  }

  // ✅ Reuse 100% BlogPostDetail component
  // Check if user is workspace creator to show delete button
  const isWorkspaceCreator = workspace?.createdBy === user?.user_id;
  const canDelete = isAdmin || post.authorId === user?.user_id || isWorkspaceCreator;

  return (
    <>
      <BlogPostDetail
        post={post}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onReport={undefined} // No report in workspace
        onDelete={canDelete ? handleDelete : undefined}
        onTagClick={handleTagClick}
        isAdmin={isAdmin}
        currentUserId={user?.user_id}
        workspaceCreatorId={workspace?.createdBy}
      />

      {/* ✅ Comments Section - Reuse 100% */}
      <div className="mt-8">
        <CommentSection
          postId={postId}
          comments={comments as any} // TODO: Fix type - comments should have author info
          postAuthorId={post.authorId}
          loading={commentsLoading}
          hasMore={false} // TODO: Implement pagination
          onLoadMore={() => {}} // TODO: Implement load more
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          onLikeComment={handleLikeComment}
        />
      </div>
    </>
  );
};

export default WorkspaceBlogPostDetail;
