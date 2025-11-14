import { useState, useEffect } from 'react';
import { PurchaseHistoryItem } from '../../types/marketplace/marketplace.types';
import marketplaceService from '../../services/marketplace.service';
import {
  validatePaginationParams,
  validatePurchaseHistoryResponse,
} from '../../utils/marketplace.transform';

interface UsePurchaseHistoryResult {
  items: PurchaseHistoryItem[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

const LIMIT = 12;

export const usePurchaseHistory = (): UsePurchaseHistoryResult => {
  const [items, setItems] = useState<PurchaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate pagination parameters
      const paginationValidation = validatePaginationParams(page, LIMIT);
      if (!paginationValidation.valid) {
        throw new Error(paginationValidation.error);
      }

      // Fetch from service
      const response = await marketplaceService.getPurchaseHistory(page, LIMIT);

      // Validate response format
      const responseValidation = validatePurchaseHistoryResponse(response);
      if (!responseValidation.valid) {
        throw new Error(responseValidation.error);
      }

      setItems(response.items);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải lịch sử đã mua';
      setError(errorMessage);
      console.error('Error fetching purchase history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseHistory();
  }, [page]);

  return {
    items,
    loading,
    error,
    page,
    total,
    setPage,
    refetch: fetchPurchaseHistory,
  };
};
