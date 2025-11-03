/**
 * Hook để quản lý logic danh sách đánh giá
 * Xử lý fetching, pagination, delete
 */

import { useState, useEffect, useCallback } from 'react';
import ratingService, { Rating, RatingStats } from '../../services/rating.service';
import { toast } from 'react-toastify';

export interface UseRatingListState {
  ratings: Rating[];
  stats: RatingStats | null;
  loading: boolean;
  page: number;
  total: number;
  limit: number;
  deletingRatingId: string | null;
}

export interface UseRatingListActions {
  fetchRatings: () => Promise<void>;
  fetchStats: () => Promise<void>;
  setPage: (page: number) => void;
  deleteRating: (ratingId: string) => void;
  confirmDelete: (ratingId: string) => Promise<boolean>;
  cancelDelete: () => void;
  refresh: () => Promise<void>;
  hasNextPage: () => boolean;
  hasPreviousPage: () => boolean;
  getTotalPages: () => number;
}

/**
 * Custom hook để quản lý rating list logic
 * @param marketplaceId - Marketplace item ID
 * @param onRatingDeleted - Callback when rating is deleted
 * @returns State và actions
 */
export const useRatingList = (
  marketplaceId: string,
  onRatingDeleted?: () => void,
): UseRatingListState & UseRatingListActions => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingRatingId, setDeletingRatingId] = useState<string | null>(null);
  const limit = 10;

  /**
   * Fetch ratings từ API
   */
  const fetchRatings = useCallback(async () => {
    try {
      setLoading(true);
      const result = await ratingService.getByMarketplaceId(
        marketplaceId,
        page,
        limit,
      );
      setRatings(result.ratings);
      setTotal(result.total);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [marketplaceId, page]);

  /**
   * Fetch stats từ API
   */
  const fetchStats = useCallback(async () => {
    try {
      const result = await ratingService.getRatingStats(marketplaceId);
      setStats(result);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Không throw error, chỉ log
    }
  }, [marketplaceId]);

  /**
   * Delete rating - set state for modal confirmation
   */
  const deleteRating = useCallback((ratingId: string): void => {
    setDeletingRatingId(ratingId);
  }, []);

  /**
   * Confirm delete rating
   */
  const confirmDelete = useCallback(
    async (ratingId: string): Promise<boolean> => {
      try {
        await ratingService.delete(ratingId);

        // Update local state
        const updatedRatings = ratings.filter((r) => r._id !== ratingId);
        setRatings(updatedRatings);
        setTotal(total - 1);

        setDeletingRatingId(null);
        onRatingDeleted?.();
        return true;
      } catch (error: any) {
        // Keep modal open on error, don't show toast
        return false;
      }
    },
    [ratings, total, onRatingDeleted],
  );

  /**
   * Cancel delete
   */
  const cancelDelete = useCallback(() => {
    setDeletingRatingId(null);
  }, []);

  /**
   * Refresh tất cả dữ liệu
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchRatings(), fetchStats()]);
  }, [fetchRatings, fetchStats]);

  /**
   * Check if has next page
   */
  const hasNextPage = useCallback((): boolean => {
    return page < Math.ceil(total / limit);
  }, [page, total, limit]);

  /**
   * Check if has previous page
   */
  const hasPreviousPage = useCallback((): boolean => {
    return page > 1;
  }, [page]);

  /**
   * Get total pages
   */
  const getTotalPages = useCallback((): number => {
    return Math.ceil(total / limit);
  }, [total, limit]);

  /**
   * Auto fetch khi marketplaceId hoặc page thay đổi
   */
  useEffect(() => {
    fetchRatings();
    fetchStats();
  }, [fetchRatings, fetchStats]);

  return {
    // State
    ratings,
    stats,
    loading,
    page,
    total,
    limit,
    deletingRatingId,
    // Actions
    fetchRatings,
    fetchStats,
    setPage,
    deleteRating,
    confirmDelete,
    cancelDelete,
    refresh,
    hasNextPage,
    hasPreviousPage,
    getTotalPages,
  };
};
