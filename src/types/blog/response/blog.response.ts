import { BlogPost, BlogComment, BlogAuthor, BlogPostWithAuthor, BlogCommentWithAuthor, BlogStats } from '../blog.types';

export interface BlogPostResponse {
  success: boolean;
  message: string;
  data: BlogPost;
}

export interface BlogPostsResponse {
  success: boolean;
  message: string;
  data: {
    posts: BlogPostWithAuthor[];
    total: number;
    hasMore: boolean;
    nextOffset?: number;
  };
}



export interface BlogCommentResponse {
  success: boolean;
  message: string;
  data: BlogComment;
}

export interface BlogCommentsResponse {
  success: boolean;
  message: string;
  data: {
    comments: BlogCommentWithAuthor[];
    total: number;
    hasMore: boolean;
    nextOffset?: number;
  };
}

export interface BlogAuthorResponse {
  success: boolean;
  message: string;
  data: BlogAuthor;
}

export interface BlogAuthorsResponse {
  success: boolean;
  message: string;
  data: BlogAuthor[];
}

export interface BlogStatsResponse {
  success: boolean;
  message: string;
  data: BlogStats;
}

export interface BlogSearchResponse {
  success: boolean;
  message: string;
  data: {
    posts: BlogPostWithAuthor[];
    total: number;
    hasMore: boolean;
    nextOffset?: number;
    facets?: {
      categories: { id: string; name: string; count: number }[];
      tags: { name: string; count: number }[];
      authors: { id: string; name: string; count: number }[];
    };
  };
}

export interface BlogLikeResponse {
  success: boolean;
  message: string;
  data: {
    isLiked: boolean;
    likeCount: number;
  };
}

export interface BlogBookmarkResponse {
  success: boolean;
  message: string;
  data: {
    isBookmarked: boolean;
    bookmarkCount: number;
  };
}

export interface BlogFollowResponse {
  success: boolean;
  message: string;
  data: {
    isFollowing: boolean;
    followerCount: number;
  };
}

export interface BlogUploadImageResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
  };
}

export interface BlogSitemapResponse {
  success: boolean;
  message: string;
  data: {
    posts: {
      id: string;
      updatedAt: number;
    }[];
  };
}