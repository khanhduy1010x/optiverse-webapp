import { MarketplaceItem } from '../types/marketplace/marketplace.types';
import { MarketplaceProduct } from '../components/Marketplace/MarketplaceCard.component';

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
        purchaseCount: item.purchase_count || 0,
        rating: 4.5,
        ratingCount: 0,
    }));
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
