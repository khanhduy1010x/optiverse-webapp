import { BlogPost, BlogComment, BlogAuthor, BlogPostWithAuthor, BlogCommentWithAuthor, BlogSearchFilters } from '../blog.types';

export interface BlogListProps {
  posts: BlogPostWithAuthor[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onPostClick?: (postId: string) => void;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string, postTitle: string) => void;
  onTagClick?: (tag: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
  showAuthor?: boolean;
  showCategory?: boolean;
  showExcerpt?: boolean;
  showActions?: boolean;
  className?: string;
}

export interface BlogPostCardProps {
  post: BlogPostWithAuthor;
  onClick?: (postId: string) => void;
  onLike?: (postId: string) => void;
  onTagClick?: (tag: string) => void;
  onComment?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string, postTitle: string) => void;
  currentUserId?: string;
  showAuthor?: boolean;
  showCategory?: boolean;
  showExcerpt?: boolean;
  showActions?: boolean;
  isAdmin?: boolean;
  className?: string;
}

export interface BlogPostDetailProps {
  post: BlogPostWithAuthor;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onShare?: (post: BlogPostWithAuthor) => void;
  onReport?: (postId: string, postTitle: string) => void;
  onDelete?: (postId: string) => void;
  onCategoryClick?: (category: string) => void;
  onTagClick?: (tag: string) => void;
  isAdmin?: boolean;
  currentUserId?: string;
  workspaceCreatorId?: string;
  className?: string;
}

export interface BlogEditorProps {
  initialData?: Partial<BlogPost>;
  tags?: string[];
  onSave?: (post: Partial<BlogPost>) => Promise<void>;
  onCancel?: () => void;
  onImageUpload?: (file: File) => Promise<string>;
  isLoading?: boolean;
  className?: string;
}

export interface BlogCommentSectionProps {
  postId: string;
  comments: BlogCommentWithAuthor[];
  postAuthorId?: string;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onAddComment?: (content: string, parentId?: string) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onLikeComment?: (commentId: string) => void;
  className?: string;
}

export interface BlogCommentItemProps {
  comment: BlogCommentWithAuthor;
  postAuthorId?: string;
  onReply?: (parentId: string, content: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
  level?: number;
  className?: string;
}

export interface BlogAuthorCardProps {
  author: BlogAuthor;
  showFollowButton?: boolean;
  onFollow?: (authorId: string) => void;
  onClick?: (author: BlogAuthor) => void;
  className?: string;
}

export interface BlogSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

export interface BlogFilterPanelProps {
  filters: BlogSearchFilters;
  authors: BlogAuthor[];
  onFiltersChange: (filters: BlogSearchFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

export interface BlogTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export interface BlogImageUploaderProps {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  loading?: boolean;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export interface BlogSidebarProps {
  popularPosts: BlogPost[];
  recentPosts: BlogPostWithAuthor[];
  tags: string[];
  onPostClick?: (post: BlogPostWithAuthor) => void;
  onTagClick?: (tag: string) => void;
  className?: string;
}

export interface BlogStatsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export interface BlogRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  readOnly?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  className?: string;
}