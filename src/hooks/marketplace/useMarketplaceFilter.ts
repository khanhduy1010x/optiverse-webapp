import { useMemo } from 'react';
import { MarketplaceProduct } from '../../components/Marketplace/MarketplaceCard.component';
import { applySearchFilter, applyPriceFilter, applyPopularityFilter, applySorting } from '../../utils/marketplace.filter';

interface FilterOptions {
    searchQuery: string;
    sortBy: string;
    priceRange: { min: number; max: number };
    popularity: string;
}

/**
 * Hook for filtering and sorting marketplace products
 */
export const useMarketplaceFilter = (
    products: MarketplaceProduct[],
    options: FilterOptions
) => {
    return useMemo(() => {
        let filtered = products;

        // Apply filters
        filtered = applySearchFilter(filtered, options.searchQuery);
        filtered = applyPriceFilter(filtered, options.priceRange);
        filtered = applyPopularityFilter(filtered, options.popularity);

        // Apply sorting
        const sorted = applySorting(filtered, options.sortBy);

        return sorted;
    }, [products, options.searchQuery, options.priceRange, options.popularity, options.sortBy]);
};
