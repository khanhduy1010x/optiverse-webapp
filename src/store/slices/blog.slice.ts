import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  BlogPost,
  BlogPostWithAuthor,
  BlogComment, 
  BlogSearchFilters, 
  BlogSortBy,
  BlogPostStatus 
} from '../../types/blog';
import { ReportWithPost } from '../../types/blog/report.types';

interface BlogState {
  // Posts state (can be BlogPost or BlogPostWithAuthor from real-time listener)
  posts: (BlogPost | BlogPostWithAuthor)[];
  currentPost: BlogPost | null;
  postsLoading: boolean;
  postsError: string | null;
  

  
  // Comments state
  comments: BlogComment[];
  commentsLoading: boolean;
  commentsError: string | null;
  
  // Search & Filter state
  searchQuery: string;
  searchFilters: BlogSearchFilters;
  searchResults: BlogPost[];
  searchLoading: boolean;
  searchError: string | null;
  
  // User interactions state
  likedPosts: string[];
  bookmarkedPosts: string[];
  followingAuthors: string[];
  
  // UI state
  selectedCategory: string | null;
  selectedTags: string[];
  sortBy: BlogSortBy;
  
  // Pagination state
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  
  // Editor state
  editorContent: string;
  editorMode: 'create' | 'edit' | null;
  editingPostId: string | null;
  
  // Popular content
  popularTags: { tag: string; count: number }[];
  relatedPosts: BlogPost[];
  
  // Reports state
  reports: ReportWithPost[];
  reportsLoading: boolean;
  reportsError: string | null;
}

const initialState: BlogState = {
  // Posts state
  posts: [],
  currentPost: null,
  postsLoading: false,
  postsError: null,
  

  
  // Comments state
  comments: [],
  commentsLoading: false,
  commentsError: null,
  
  // Search & Filter state
  searchQuery: '',
  searchFilters: {
    query: '',
    categoryId: '',
    tags: [],
    authorId: '',
    sortBy: BlogSortBy.CREATED_DESC,
    page: 0,
    limit: 20,
    isPublic: undefined,
    startDate: undefined,
    endDate: undefined
  },
  searchResults: [],
  searchLoading: false,
  searchError: null,
  
  // User interactions state
  likedPosts: [],
  bookmarkedPosts: [],
  followingAuthors: [],
  
  // UI state
  selectedCategory: null,
  selectedTags: [],
  sortBy: BlogSortBy.CREATED_DESC,
  
  // Pagination state
  currentPage: 0,
  totalPages: 0,
  hasMore: true,
  
  // Editor state
  editorContent: '',
  editorMode: null,
  editingPostId: null,
  
  // Popular content
  popularTags: [],
  relatedPosts: [],
  
  // Reports state
  reports: [],
  reportsLoading: false,
  reportsError: null
};

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    // Posts actions
    setPostsLoading: (state, action: PayloadAction<boolean>) => {
      state.postsLoading = action.payload;
    },
    setPostsError: (state, action: PayloadAction<string | null>) => {
      state.postsError = action.payload;
    },
    setPosts: (state, action: PayloadAction<(BlogPost | BlogPostWithAuthor)[]>) => {
      state.posts = action.payload;
      state.postsError = null;
    },
    addPost: (state, action: PayloadAction<BlogPost | BlogPostWithAuthor>) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action: PayloadAction<BlogPost | BlogPostWithAuthor>) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      if (state.currentPost?.id === action.payload.id) {
        state.currentPost = action.payload;
      }
    },
    removePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(post => post.id !== action.payload);
      if (state.currentPost?.id === action.payload) {
        state.currentPost = null;
      }
    },
    setCurrentPost: (state, action: PayloadAction<BlogPost | null>) => {
      state.currentPost = action.payload;
    },
    appendPosts: (state, action: PayloadAction<(BlogPost | BlogPostWithAuthor)[]>) => {
      state.posts.push(...action.payload);
    },
    

    
    // Comments actions
    setCommentsLoading: (state, action: PayloadAction<boolean>) => {
      state.commentsLoading = action.payload;
    },
    setCommentsError: (state, action: PayloadAction<string | null>) => {
      state.commentsError = action.payload;
    },
    setComments: (state, action: PayloadAction<BlogComment[]>) => {
      state.comments = action.payload;
      state.commentsError = null;
    },
    addComment: (state, action: PayloadAction<BlogComment>) => {
      state.comments.push(action.payload);
    },
    updateComment: (state, action: PayloadAction<BlogComment>) => {
      const index = state.comments.findIndex(comment => comment.id === action.payload.id);
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    },
    removeComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter(comment => comment.id !== action.payload);
    },
    
    // Search & Filter actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchFilters: (state, action: PayloadAction<Partial<BlogSearchFilters>>) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.searchLoading = action.payload;
    },
    setSearchError: (state, action: PayloadAction<string | null>) => {
      state.searchError = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<BlogPost[]>) => {
      state.searchResults = action.payload;
      state.searchError = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    
    // User interactions actions
    setLikedPosts: (state, action: PayloadAction<string[]>) => {
      state.likedPosts = action.payload;
    },
    toggleLikedPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const index = state.likedPosts.indexOf(postId);
      if (index !== -1) {
        state.likedPosts.splice(index, 1);
      } else {
        state.likedPosts.push(postId);
      }
    },
    setBookmarkedPosts: (state, action: PayloadAction<string[]>) => {
      state.bookmarkedPosts = action.payload;
    },
    toggleBookmarkedPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const index = state.bookmarkedPosts.indexOf(postId);
      if (index !== -1) {
        state.bookmarkedPosts.splice(index, 1);
      } else {
        state.bookmarkedPosts.push(postId);
      }
    },
    setFollowingAuthors: (state, action: PayloadAction<string[]>) => {
      state.followingAuthors = action.payload;
    },
    toggleFollowingAuthor: (state, action: PayloadAction<string>) => {
      const authorId = action.payload;
      const index = state.followingAuthors.indexOf(authorId);
      if (index !== -1) {
        state.followingAuthors.splice(index, 1);
      } else {
        state.followingAuthors.push(authorId);
      }
    },
    
    // UI actions
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload;
    },
    addSelectedTag: (state, action: PayloadAction<string>) => {
      if (!state.selectedTags.includes(action.payload)) {
        state.selectedTags.push(action.payload);
      }
    },
    removeSelectedTag: (state, action: PayloadAction<string>) => {
      state.selectedTags = state.selectedTags.filter(tag => tag !== action.payload);
    },
    setSortBy: (state, action: PayloadAction<BlogSortBy>) => {
      state.sortBy = action.payload;
    },
    
    // Pagination actions
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setTotalPages: (state, action: PayloadAction<number>) => {
      state.totalPages = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    
    // Editor actions
    setEditorContent: (state, action: PayloadAction<string>) => {
      state.editorContent = action.payload;
    },
    setEditorMode: (state, action: PayloadAction<'create' | 'edit' | null>) => {
      state.editorMode = action.payload;
    },
    setEditingPostId: (state, action: PayloadAction<string | null>) => {
      state.editingPostId = action.payload;
    },
    clearEditor: (state) => {
      state.editorContent = '';
      state.editorMode = null;
      state.editingPostId = null;
    },
    
    // Popular content actions
    setPopularTags: (state, action: PayloadAction<{ tag: string; count: number }[]>) => {
      state.popularTags = action.payload;
    },
    setRelatedPosts: (state, action: PayloadAction<BlogPost[]>) => {
      state.relatedPosts = action.payload;
    },
    
    // Reports actions
    setReportsLoading: (state, action: PayloadAction<boolean>) => {
      state.reportsLoading = action.payload;
    },
    setReportsError: (state, action: PayloadAction<string | null>) => {
      state.reportsError = action.payload;
    },
    setReports: (state, action: PayloadAction<ReportWithPost[]>) => {
      state.reports = action.payload;
      state.reportsError = null;
    },
    addReport: (state, action: PayloadAction<ReportWithPost>) => {
      state.reports.unshift(action.payload);
    },
    updateReport: (state, action: PayloadAction<ReportWithPost>) => {
      const index = state.reports.findIndex(report => report.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
    },
    removeReport: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(report => report.id !== action.payload);
    },
    
    // Reset actions
    resetBlogState: () => initialState,
    resetSearchState: (state) => {
      state.searchFilters = initialState.searchFilters;
      state.searchResults = [];
      state.searchLoading = false;
      state.searchError = null;
    }
  }
});

export const {
  // Posts actions
  setPostsLoading,
  setPostsError,
  setPosts,
  addPost,
  updatePost,
  removePost,
  setCurrentPost,
  appendPosts,
  

  
  // Comments actions
  setCommentsLoading,
  setCommentsError,
  setComments,
  addComment,
  updateComment,
  removeComment,
  
  // Search & Filter actions
  setSearchQuery,
  setSearchFilters,
  setSearchLoading,
  setSearchError,
  setSearchResults,
  clearSearchResults,
  
  // User interactions actions
  setLikedPosts,
  toggleLikedPost,
  setBookmarkedPosts,
  toggleBookmarkedPost,
  setFollowingAuthors,
  toggleFollowingAuthor,
  
  // UI actions
  setSelectedCategory,
  setSelectedTags,
  addSelectedTag,
  removeSelectedTag,
  setSortBy,
  
  // Pagination actions
  setCurrentPage,
  setTotalPages,
  setHasMore,
  
  // Editor actions
  setEditorContent,
  setEditorMode,
  setEditingPostId,
  clearEditor,
  
  // Popular content
  setPopularTags,
  setRelatedPosts,
  
  // Reports actions
  setReportsLoading,
  setReportsError,
  setReports,
  addReport,
  updateReport,
  removeReport,
  
  // Reset actions
  resetBlogState,
  resetSearchState
} = blogSlice.actions;

export default blogSlice.reducer;