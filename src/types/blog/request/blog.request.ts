export interface CreateBlogPostRequest {
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  isPublic: boolean;
  isDraft: boolean;
  images?: string[];
  metaTitle?: string;
}

export interface UpdateBlogPostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  tags?: string[];
  isPublic?: boolean;
  isDraft?: boolean;
  images?: string[];
  metaTitle?: string;
}



export interface CreateBlogCommentRequest {
  postId: string;
  content: string;
  parentId?: string;
}

export interface UpdateBlogCommentRequest {
  content: string;
}

export interface UpdateBlogAuthorRequest {
  displayName?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
  };
}

export interface BlogSearchRequest {
  query?: string;
  tags?: string[];
  authorId?: string;
  isPublic?: boolean;
  dateFrom?: number;
  dateTo?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface LikeBlogPostRequest {
  postId: string;
}

export interface LikeBlogCommentRequest {
  commentId: string;
}

export interface BookmarkBlogPostRequest {
  postId: string;
}

export interface FollowBlogAuthorRequest {
  authorId: string;
}