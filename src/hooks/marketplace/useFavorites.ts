import { useState, useEffect } from 'react';
import favoriteService from '../../services/favorite.service';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';

interface UseFavoritesResult {
  items: MarketplaceItem[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export const useFavorites = (): UseFavoritesResult => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoriteService.getMyFavorites(page, 10);
      setItems(response.items || []);
      setTotal(response.total || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách yêu thích');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [page]);

  return {
    items,
    loading,
    error,
    page,
    total,
    setPage,
    refetch: fetchFavorites,
  };
};
