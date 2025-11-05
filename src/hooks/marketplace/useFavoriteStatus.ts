import { useState, useEffect } from 'react';
import favoriteService from '../../services/favorite.service';

interface UseFavoriteStatusResult {
  isFavorited: boolean;
  loading: boolean;
  setIsFavorited: (value: boolean) => void;
}

export const useFavoriteStatus = (itemId: string | null): UseFavoriteStatusResult => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!itemId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await favoriteService.checkFavorite(itemId);
        setIsFavorited(response.isFavorited);
      } catch (err) {
        console.error('Error checking favorite status:', err);
        setIsFavorited(false);
      } finally {
        setLoading(false);
      }
    };

    checkFavoriteStatus();
  }, [itemId]);

  return {
    isFavorited,
    loading,
    setIsFavorited,
  };
};
