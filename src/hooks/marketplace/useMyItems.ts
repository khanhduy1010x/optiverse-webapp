import { useState, useEffect } from 'react';
import marketplaceService from '../../services/marketplace.service';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';

interface UseMyItemsResult {
    items: MarketplaceItem[];
    loading: boolean;
    error: string | null;
    page: number;
    total: number;
    setPage: (page: number) => void;
    refetch: () => Promise<void>;
}

export const useMyItems = (): UseMyItemsResult => {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchMyItems = async () => {
        try {
            setLoading(true);
            const response = await marketplaceService.getMyItems(page, 12);
            setItems(response.items || []);
            setTotal(response.total || 0);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
            console.error('Error fetching user items:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyItems();
    }, [page]);

    return {
        items,
        loading,
        error,
        page,
        total,
        setPage,
        refetch: fetchMyItems,
    };
};
