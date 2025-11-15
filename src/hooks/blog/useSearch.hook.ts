import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  setSearchQuery, 
  setSearchResults, 
  setSearchLoading, 
  setSearchError,
  setSearchFilters,
  clearSearchResults,
  setPopularTags,
  setRelatedPosts
} from '../../store/slices/blog.slice';
import { BlogService } from '../../services/blog';
import SearchService from '../../services/blog/search.service';
import { BlogPost, BlogSearchFilters, SortOption } from '../../types/blog/blog.types';

export const useSearch = () => {
  const dispatch = useDispatch();
  const { 
    searchQuery, 
    searchResults, 
    searchLoading, 
    searchError, 
    searchFilters,
    popularTags,
    relatedPosts
  } = useSelector((state: RootState) => state.blog);

  const blogService = BlogService;

  // Search posts with filters
  const searchPosts = useCallback(async (
    options?: {
      query?: string;
      filters?: Partial<BlogSearchFilters>;
      sortBy?: SortOption;
      searchType?: string;
    }
  ) => {
    try {
      dispatch(setSearchLoading(true));
      dispatch(setSearchError(null));

      const searchTerm = options?.query !== undefined ? options.query : searchQuery;
      const searchFilters = { ...options?.filters };
      const searchType = options?.searchType || 'all';

      if (searchTerm) {
        dispatch(setSearchQuery(searchTerm));
      }

      if (options?.filters) {
        dispatch(setSearchFilters(options.filters));
      }

      const searchFiltersForService: BlogSearchFilters = {
        query: searchTerm,
        tags: searchFilters.tags,
        authorId: searchFilters.authorId,
        isPublic: searchFilters.isPublic,
        dateFrom: searchFilters.dateFrom,
        dateTo: searchFilters.dateTo,
        sortBy: options?.sortBy === 'newest' ? 'createdAt' : 
               options?.sortBy === 'most_liked' ? 'likeCount' :
               options?.sortBy === 'most_viewed' ? 'viewCount' :
               options?.sortBy === 'most_commented' ? 'commentCount' : 'createdAt',
        sortOrder: 'desc'
      };

      const results = await blogService.searchPosts(searchTerm, searchFiltersForService, searchType);

      dispatch(setSearchResults(results));
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      dispatch(setSearchError(errorMessage));
      throw error;
    } finally {
      dispatch(setSearchLoading(false));
    }
  }, [dispatch, searchQuery, blogService]);

  // Search posts by tag
  const searchPostsByTag = useCallback(async (tag: string, limit?: number) => {
    try {
      dispatch(setSearchLoading(true));
      const results = await blogService.searchPosts(tag, {}, 'all');
      dispatch(setSearchResults(results));
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Tag search failed';
      dispatch(setSearchError(errorMessage));
      throw error;
    } finally {
      dispatch(setSearchLoading(false));
    }
  }, [dispatch, blogService]);

  // Search posts by author
  const searchPostsByAuthor = useCallback(async (authorId: string, limit?: number) => {
    try {
      dispatch(setSearchLoading(true));
      const results = await blogService.searchPosts('', { authorId }, 'author');
      dispatch(setSearchResults(results));
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Author search failed';
      dispatch(setSearchError(errorMessage));
      throw error;
    } finally {
      dispatch(setSearchLoading(false));
    }
  }, [dispatch, blogService]);

  // Get popular tags
  const getPopularTags = useCallback(async (limit: number = 20) => {
    try {
      const results = await SearchService.getPopularTags(limit);
      dispatch(setPopularTags(results));
      return results;
    } catch (error) {
      console.error('Failed to fetch popular tags:', error);
      throw error;
    }
  }, [dispatch]);

  // Get related posts
  const getRelatedPosts = useCallback(async (postId: string, limit: number = 5) => {
    try {
      const results = await SearchService.getRelatedPosts(postId, limit);
      dispatch(setRelatedPosts(results));
      return results;
    } catch (error) {
      console.error('Failed to fetch related posts:', error);
      throw error;
    }
  }, [dispatch]);

  // Clear search results
  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  // Update search query
  const updateSearchQuery = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  // Update search filters
  const updateSearchFilters = useCallback((filters: Partial<BlogSearchFilters>) => {
    dispatch(setSearchFilters(filters));
  }, [dispatch]);

  // Auto-search effect
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchPosts();
      }, 500); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, searchPosts]);

  return {
    // State
    searchQuery,
    searchResults,
    searchLoading,
    searchError,
    searchFilters,
    popularTags,
    relatedPosts,

    // Actions
    searchPosts,
    searchPostsByTag,
    searchPostsByAuthor,
    getPopularTags,
    getRelatedPosts,
    clearSearch,
    updateSearchQuery,
    updateSearchFilters
  };
};