import { MarketplaceItem } from '../types/marketplace/marketplace.types';
import { MarketplaceProduct } from '../components/Marketplace/MarketplaceCard.component';
import ratingService from '../services/rating.service';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop';

/**
 * Transform marketplace items to product format for display
 */
export const transformItemsToProducts = (items: MarketplaceItem[]): MarketplaceProduct[] => {
    return items.map((item) => ({
        id: item._id,
        name: item.title,
        image: item.images?.[0] || DEFAULT_IMAGE,
        price: item.price,
        sellerName: item.creator_info?.full_name || 'Unknown',
        sellerInfo: item.creator_info,
        creatorId: item.creator_id,
        purchaseCount: item.purchase_count || 0,
        rating: item.ratingStats?.averageRating || 0,
        ratingCount: item.ratingStats?.totalRatings || 0,
        description: item.description,
        isPurchased: item.is_purchased || false,
    }));
};

/**
 * Transform marketplace items with async rating stats fetch
 */
export const transformItemsToProductsWithRatings = async (
    items: MarketplaceItem[]
): Promise<MarketplaceProduct[]> => {
    const productsWithRatings = await Promise.all(
        items.map(async (item) => {
            try {
                const stats = await ratingService.getRatingStats(item._id);
                return {
                    id: item._id,
                    name: item.title,
                    image: item.images?.[0] || DEFAULT_IMAGE,
                    price: item.price,
                    sellerName: item.creator_info?.full_name || 'Unknown',
                    sellerInfo: item.creator_info,
                    creatorId: item.creator_id,
                    purchaseCount: item.purchase_count || 0,
                    rating: stats.averageRating || 0,
                    ratingCount: stats.totalRatings || 0,
                    description: item.description,
                    isPurchased: item.is_purchased || false,
                };
            } catch (error) {
                console.error(`Error fetching ratings for item ${item._id}:`, error);
                // Fallback to default if rating fetch fails
                return {
                    id: item._id,
                    name: item.title,
                    image: item.images?.[0] || DEFAULT_IMAGE,
                    price: item.price,
                    sellerName: item.creator_info?.full_name || 'Unknown',
                    sellerInfo: item.creator_info,
                    creatorId: item.creator_id,
                    purchaseCount: item.purchase_count || 0,
                    rating: 0,
                    ratingCount: 0,
                    description: item.description,
                    isPurchased: item.is_purchased || false,
                };
            }
        })
    );

    return productsWithRatings;
};

/**
 * Filter out items created by a specific user
 */
export const filterOutUserItems = (items: MarketplaceItem[], userId?: string | null): MarketplaceItem[] => {
    if (!userId) {
        return items;
    }
    return items.filter(item => item.creator_id !== userId);
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (price: number): string => {
    if (price === 0) {
        return 'Free';
    }
    return `${price} OP`;
};

// ============ VALIDATION FUNCTIONS ============

/**
 * Validate marketplace item title
 */
export const validateMarketplaceTitle = (title: string): string | true => {
    if (!title || !title.trim()) {
        return 'Please enter marketplace item name';
    }
    if (title.trim().length > 200) {
        return 'Title must be less than 200 characters';
    }
    return true;
};

/**
 * Validate marketplace item description
 */
export const validateMarketplaceDescription = (description?: string): string | true => {
    if (description && description.length > 1000) {
        return 'Description must be less than 1000 characters';
    }
    return true;
};

/**
 * Validate marketplace item type
 */
export const validateMarketplaceType = (type: string): string | true => {
    if (!type) {
        return 'Please select item type';
    }
    return true;
};

/**
 * Validate marketplace item type_id (e.g., flashcard deck id)
 */
export const validateMarketplaceTypeId = (typeId: string): string | true => {
    if (!typeId) {
        return 'Please select a flashcard deck';
    }
    return true;
};

/**
 * Validate marketplace item price
 */
export const validateMarketplacePrice = (price: number): string | true => {
    if (price < 0) {
        return 'Price cannot be negative';
    }
    if (!Number.isInteger(price)) {
        return 'Price must be a whole number';
    }
    return true;
};

/**
 * Validate marketplace item images count
 */
export const validateMarketplaceImages = (imagesCount: number): string | true => {
    if (imagesCount > 5) {
        return 'Maximum 5 images are allowed';
    }
    return true;
};

/**
 * Validate complete marketplace item form
 */
export interface ValidateMarketplaceItemInput {
    title: string;
    description?: string;
    type: string;
    typeId: string;
    price: number;
    imagesCount: number;
}

export const validateMarketplaceItem = (data: ValidateMarketplaceItemInput): { valid: boolean; error?: string } => {
    // Validate title
    const titleValidation = validateMarketplaceTitle(data.title);
    if (titleValidation !== true) {
        return { valid: false, error: titleValidation };
    }

    // Validate description
    const descriptionValidation = validateMarketplaceDescription(data.description);
    if (descriptionValidation !== true) {
        return { valid: false, error: descriptionValidation };
    }

    // Validate type
    const typeValidation = validateMarketplaceType(data.type);
    if (typeValidation !== true) {
        return { valid: false, error: typeValidation };
    }

    // Validate typeId
    const typeIdValidation = validateMarketplaceTypeId(data.typeId);
    if (typeIdValidation !== true) {
        return { valid: false, error: typeIdValidation };
    }

    // Validate price
    const priceValidation = validateMarketplacePrice(data.price);
    if (priceValidation !== true) {
        return { valid: false, error: priceValidation };
    }

    // Validate images count
    const imagesValidation = validateMarketplaceImages(data.imagesCount);
    if (imagesValidation !== true) {
        return { valid: false, error: imagesValidation };
    }

    return { valid: true };
};

// ============ PURCHASE HISTORY VALIDATION FUNCTIONS ============

/**
 * Validate pagination parameters
 */
export const validatePaginationParams = (page: number, limit: number): { valid: boolean; error?: string } => {
    if (!Number.isInteger(page) || page < 1) {
        return { valid: false, error: 'Page must be a positive integer' };
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return { valid: false, error: 'Limit must be between 1 and 100' };
    }
    return { valid: true };
};

/**
 * Validate purchase history item
 */
export interface ValidatePurchaseHistoryItemInput {
    _id: string;
    buyer_id: string;
    seller_id: string;
    marketplace_item_id: string;
    price: number;
    purchased_at: string;
}

export const validatePurchaseHistoryItem = (item: any): { valid: boolean; error?: string } => {
    if (!item._id || typeof item._id !== 'string') {
        return { valid: false, error: 'Invalid purchase history ID' };
    }

    if (!item.buyer_id || typeof item.buyer_id !== 'string') {
        return { valid: false, error: 'Invalid buyer ID' };
    }

    if (!item.seller_id || typeof item.seller_id !== 'string') {
        return { valid: false, error: 'Invalid seller ID' };
    }

    if (!item.marketplace_item_id || typeof item.marketplace_item_id !== 'string') {
        return { valid: false, error: 'Invalid marketplace item ID' };
    }

    if (typeof item.price !== 'number' || item.price < 0) {
        return { valid: false, error: 'Invalid price' };
    }

    if (!item.purchased_at || isNaN(new Date(item.purchased_at).getTime())) {
        return { valid: false, error: 'Invalid purchase date' };
    }

    // item field is optional and can be any object
    if (item.item && typeof item.item !== 'object') {
        return { valid: false, error: 'Invalid item object' };
    }

    return { valid: true };
};

/**
 * Validate purchase history response
 */
export const validatePurchaseHistoryResponse = (data: any): { valid: boolean; error?: string } => {
    if (!Array.isArray(data.items)) {
        return { valid: false, error: 'Invalid items format' };
    }

    if (typeof data.total !== 'number' || data.total < 0) {
        return { valid: false, error: 'Invalid total count' };
    }

    // Validate each item
    for (const item of data.items) {
        const itemValidation = validatePurchaseHistoryItem(item);
        if (!itemValidation.valid) {
            return itemValidation;
        }
    }

    return { valid: true };
};

