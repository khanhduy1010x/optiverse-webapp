import { useState, useEffect } from 'react';
import marketplaceFollowerService from '../../services/marketplace-follower.service';
import { toast } from 'react-toastify';

interface UseFollowCreatorReturn {
  isFollowing: boolean;
  isLoading: boolean;
  error: string | null;
  toggleFollow: () => Promise<void>;
}

export const useFollowCreator = (creatorId: string | null): UseFollowCreatorReturn => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already following when component mounts or creatorId changes
  useEffect(() => {
    if (!creatorId) {
      setIsFollowing(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const result = await marketplaceFollowerService.isFollowing(creatorId);
        setIsFollowing(result.isFollowing);
      } catch (err) {
        console.error('Error checking follow status:', err);
        // Don't show error to user, just default to not following
      }
    };

    checkFollowStatus();
  }, [creatorId]);

  const toggleFollow = async () => {
    if (!creatorId) {
      setError('Creator ID not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await marketplaceFollowerService.toggleFollow(creatorId);
      setIsFollowing(result.isFollowing);
      toast.success(result.message);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update follow status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFollowing,
    isLoading,
    error,
    toggleFollow,
  };
};
