export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  tags: string[];
  isPublic: boolean;
  isDraft: boolean;
  images?: string[]; // Thêm field cho nhiều ảnh
  metaTitle?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  
  // Workspace Integration - Simplified (chỉ cần workspaceId)
  workspaceId?: string; // Nếu có workspaceId => đây là workspace blog
}



export interface BlogComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string; // For nested comments
  isEdited: boolean;
  likeCount: number;
  replyCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface BlogAuthor {
  id: string;
  userId: string;
  name: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
  };
  postCount: number;
  followerCount: number;
  followingCount: number;
  isVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BlogLike {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt: number;
}

export interface BlogBookmark {
  id: string;
  userId: string;
  postId: string;
  createdAt: number;
}

export interface BlogFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: number;
}

export interface BlogStats {
  totalPosts: number;
  totalPublicPosts: number;
  totalDrafts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalBookmarks: number;
}

export interface BlogSearchFilters {
  query?: string;
  tags?: string[];
  authorId?: string;
  isPublic?: boolean;
  dateFrom?: number;
  dateTo?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount' | 'likeCount' | 'commentCount';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface BlogPostWithAuthor extends BlogPost {
  author: BlogAuthor;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface BlogCommentWithAuthor extends BlogComment {
  author: BlogAuthor;
  replies?: BlogCommentWithAuthor[];
  isLiked?: boolean;
}

export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum BlogSortBy {
  NEWEST = 'newest',
  MOST_LIKED = 'most_liked',
  MOST_VIEWED = 'most_viewed',
  MOST_COMMENTED = 'most_commented'
}

// Additional types for enhanced functionality
export interface SearchFilters {
  tags?: string[];
  author?: string;
  dateRange?: {
    start: number;
    end: number;
  };
  isPublic?: boolean;
}

export type SortOption = 'newest' | 'most_liked' | 'most_viewed' | 'most_commented';

export type SearchType = 'all' | 'title' | 'author' | 'content' | 'tags';

export interface BlogTag {
  name: string;
  count: number;
  color?: string;
}

export interface BlogView {
  id: string;
  postId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: number;
}

export interface BlogDraft {
  id: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  images?: string[];
  metaTitle?: string;
  autoSavedAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface BlogEditorState {
  currentDraft?: BlogDraft;
  isEditing: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved?: number;
}

export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BlogListResponse {
  posts: BlogPostWithAuthor[];
  pagination: BlogPagination;
}

export interface BlogSearchResponse {
  posts: BlogPostWithAuthor[];
  tags: BlogTag[];
  pagination: BlogPagination;
}

export interface BlogNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  userId: string;
  triggeredBy: string;
  postId?: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

export interface BlogSettings {
  allowComments: boolean;
  moderateComments: boolean;
  allowAnonymousComments: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  showAuthorInfo: boolean;
  showRelatedPosts: boolean;
  postsPerPage: number;
  defaultPostStatus: BlogPostStatus;
}

export interface BlogAnalytics {
  postId: string;
  views: number;
  uniqueViews: number;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
  bounceRate: number;
  engagementRate: number;
  topReferrers: string[];
  viewsByDate: { [date: string]: number };
}

export interface BlogFormData {
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  isPublic: boolean;
  isDraft: boolean;
  images?: string[]; // Thêm field cho nhiều ảnh
  metaTitle?: string;
}

export interface BlogValidationError {
  field: string;
  message: string;
}

export interface BlogApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: BlogValidationError[];
}

// Redux state interfaces
export interface BlogState {
  posts: {
    items: BlogPostWithAuthor[];
    loading: boolean;
    error: string | null;
    pagination: BlogPagination | null;
    currentPost: BlogPostWithAuthor | null;
  };

  comments: {
    items: BlogCommentWithAuthor[];
    loading: boolean;
    error: string | null;
    replyingTo: string | null;
  };
  search: {
    query: string;
    results: BlogPostWithAuthor[];
    loading: boolean;
    error: string | null;
    filters: SearchFilters;
    popularTags: BlogTag[];
    relatedPosts: BlogPostWithAuthor[];
  };
  userInteractions: {
    likedPosts: string[];
    bookmarkedPosts: string[];
    followedAuthors: string[];
    loading: boolean;
    error: string | null;
  };
  ui: {
    sidebarOpen: boolean;
    viewMode: 'grid' | 'list';
    theme: 'light' | 'dark';
    showPreview: boolean;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
  editor: BlogEditorState;
  popular: {
    posts: BlogPostWithAuthor[];
    tags: BlogTag[];
    authors: BlogAuthor[];
  };
}