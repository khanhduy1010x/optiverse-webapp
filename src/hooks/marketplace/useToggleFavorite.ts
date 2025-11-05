import { useState } from 'react';
import favoriteService from '../../services/favorite.service';
import { toast } from 'react-toastify';

interface UseToggleFavoriteResult {
  isFavorited: boolean;
  isToggling: boolean;
  error: string | null;
  toggleFavorite: (itemId: string) => Promise<void>;
  setIsFavorited: (value: boolean) => void;
}

export const useToggleFavorite = (
  initialFavorited: boolean = false,
  onSuccess?: (isFavorited: boolean) => void
): UseToggleFavoriteResult => {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFavorite = async (itemId: string) => {
    setIsToggling(true);
    setError(null);

    try {
      const response = await favoriteService.toggleFavorite({
        marketplace_item_id: itemId,
      });

      setIsFavorited(response.isFavorited);
      
      // Show toast notification
      if (response.isFavorited) {
        toast.success('Đã thêm vào yêu thích ❤️');
      } else {
        toast.info('Đã xóa khỏi yêu thích');
      }

      onSuccess?.(response.isFavorited);
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error toggling favorite:', err);
    } finally {
      setIsToggling(false);
    }
  };

  return {
    isFavorited,
    isToggling,
    error,
    toggleFavorite,
    setIsFavorited,
  };
};
