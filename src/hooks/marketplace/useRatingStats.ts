import { useState, useEffect } from 'react';
import ratingService, { RatingStats } from '../../services/rating.service';

interface UseRatingStatsResult {
  stats: RatingStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const useRatingStats = (marketplaceId: string): UseRatingStatsResult => {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!marketplaceId) return;

    setLoading(true);
    setError(null);
    try {
      const ratingStats = await ratingService.getRatingStats(marketplaceId);
      setStats(ratingStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rating stats';
      setError(errorMessage);
      // Set default stats on error
      setStats({
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [marketplaceId]);

  const refreshStats = async () => {
    await fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
};
