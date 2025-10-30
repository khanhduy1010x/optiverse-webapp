import { useState, useEffect, useCallback } from 'react';
import userInventoryService from '../../services/user-inventory.service';

interface UseUserInventoryReturn {
  userPoints: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserInventory = (): UseUserInventoryReturn => {
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPoints = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const points = await userInventoryService.getUserPoints();
      setUserPoints(points);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải điểm OP';
      setError(errorMessage);
      console.error('Error fetching user points:', err);
      setUserPoints(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserPoints();
  }, [fetchUserPoints]);

  return {
    userPoints,
    isLoading,
    error,
    refetch: fetchUserPoints,
  };
};
