import { useState, useEffect } from 'react';
import marketplaceService from '../../services/marketplace.service';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { filterOutUserItems } from '../../utils/marketplace.transform';

interface UseMarketplaceItemsResult {
    items: MarketplaceItem[];
    loading: boolean;
    error: string | null;
    page: number;
    total: number;
    setPage: (page: number) => void;
    refetch: () => Promise<void>;
}

export const useMarketplaceItems = (currentUserId?: string | null): UseMarketplaceItemsResult => {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchItems = async () => {
        try {
            setLoading(true);
            // Use paginated endpoint with default params
            const response = await marketplaceService.getPaginated(`page=${page}&limit=12`);
            // Filter out items created by the current user
            const filteredItems = filterOutUserItems(response.items || []);
            setItems(filteredItems);
            setTotal(response.total || 0);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
            console.error('Error fetching marketplace items:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [page, currentUserId]);

    return {
        items,
        loading,
        error,
        page,
        total,
        setPage,
        refetch: fetchItems,
    };
};
