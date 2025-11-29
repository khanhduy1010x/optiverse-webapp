import { useState, useEffect } from 'react';
import marketplaceService from '../../services/marketplace.service';
import { transformItemsToProductsWithRatings } from '../../utils/marketplace.transform';
import { MarketplaceProduct } from '../../components/Marketplace/MarketplaceCard.component';

interface UseMarketplaceSearchOptions {
    searchQuery: string;
    priceRange: { min: number; max: number };
    sortBy: string;
    creatorId?: string;
}

interface UseMarketplaceSearchReturn {
    products: MarketplaceProduct[];
    loading: boolean;
    error: string | null;
    total: number;
    totalPages: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
}

/**
 * Hook for managing marketplace search, filtering, and pagination
 */
export const useMarketplaceSearch = (options: UseMarketplaceSearchOptions): UseMarketplaceSearchReturn => {
    const [products, setProducts] = useState<MarketplaceProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [options.searchQuery, options.priceRange, options.sortBy, options.creatorId]);

    // Fetch filtered items from backend
    useEffect(() => {
        const fetchFilteredItems = async () => {
            try {
                setLoading(true);
                setError(null);

                // Build query parameters
                const queryParams = new URLSearchParams();
                queryParams.append('page', currentPage.toString());
                queryParams.append('limit', '12');
                
                if (options.searchQuery) {
                    queryParams.append('search', options.searchQuery);
                }

                // Add creator filter if provided
                if (options.creatorId) {
                    queryParams.append('creatorId', options.creatorId);
                }

                // Format price range for backend
                const priceQueryValue = 
                    options.priceRange.min === 0 && options.priceRange.max === 0
                        ? '0'
                        : `${options.priceRange.min}-${options.priceRange.max}`;
                
                if (options.priceRange.min !== 0 || options.priceRange.max !== 1000) {
                    queryParams.append('price', priceQueryValue);
                }

                // Add sort option
                if (options.sortBy && options.sortBy !== 'newest') {
                    queryParams.append('sort', options.sortBy);
                }

                // Fetch from API
                const response = await marketplaceService.getPaginated(queryParams.toString());
                const filteredItems = response.items || [];
                const productsWithRatings = await transformItemsToProductsWithRatings(filteredItems);

                setProducts(productsWithRatings);
                setTotal(response.total || 0);
                setTotalPages(response.totalPages || 0);
            } catch (err) {
                console.error('Error fetching filtered items:', err);
                setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
                setProducts([]);
                setTotal(0);
                setTotalPages(0);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredItems();
    }, [currentPage, options.searchQuery, options.priceRange, options.sortBy, options.creatorId]);

    return {
        products,
        loading,
        error,
        total,
        totalPages,
        currentPage,
        setCurrentPage,
    };
};
