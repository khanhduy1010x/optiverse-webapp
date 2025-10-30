import { MarketplaceProduct } from '../components/Marketplace/MarketplaceCard.component';

/**
 * Apply search filter to products
 */
export const applySearchFilter = (
    products: MarketplaceProduct[],
    searchQuery: string
): MarketplaceProduct[] => {
    if (!searchQuery) {
        return products;
    }
    return products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
};

/**
 * Apply price range filter to products
 */
export const applyPriceFilter = (
    products: MarketplaceProduct[],
    priceRange: { min: number; max: number }
): MarketplaceProduct[] => {
    return products.filter(product =>
        product.price >= priceRange.min && product.price <= priceRange.max
    );
};

/**
 * Apply popularity filter to products
 */
export const applyPopularityFilter = (
    products: MarketplaceProduct[],
    popularity: string
): MarketplaceProduct[] => {
    if (popularity === 'all') {
        return products;
    }

    return products.filter(product => {
        switch (popularity) {
            case 'top-100':
                return product.purchaseCount >= 500;
            case 'top-1000':
                return product.purchaseCount >= 1000;
            case 'top-500':
                return product.purchaseCount >= 500;
            default:
                return true;
        }
    });
};

/**
 * Apply sorting to products
 */
export const applySorting = (
    products: MarketplaceProduct[],
    sortBy: string
): MarketplaceProduct[] => {
    const sorted = [...products];

    switch (sortBy) {
        case 'newest':
            break;
        case 'oldest':
            sorted.reverse();
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'popular':
            sorted.sort((a, b) => b.purchaseCount - a.purchaseCount);
            break;
        default:
            break;
    }

    return sorted;
};
