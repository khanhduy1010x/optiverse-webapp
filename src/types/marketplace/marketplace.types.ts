export interface CreatorInfo {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface RatingStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export interface PricingInfo {
  original_price: number;
  discount_percentage: number;
  discount_amount: number;
  final_price: number;
  membership_tier?: string;
}

export interface MarketplaceItem {
  _id: string;
  creator_id: string;
  creator_info?: CreatorInfo;
  title: string;
  description?: string;
  images?: string[];
  price: number;
  type: string;
  type_id?: string;
  purchase_count?: number;
  ratingStats?: RatingStats;
  is_purchased?: boolean;
  pricing?: PricingInfo;
}

export interface CreateMarketplaceItemPayload {
  title: string;
  description?: string;
  price: number;
  type: string;
  type_id?: string;
  images?: File[];
}

export interface UpdateMarketplaceItemPayload {
  title?: string;
  description?: string;
  price?: number;
  type_id?: string;
  images?: File[];
}

export interface PurchasePayload {
  marketplace_item_id: string;
}

export interface PurchaseResponse {
  message: string;
  marketplace_item_id: string;
  purchased_flashcard_id: string;
  purchased_deck_id: string;
  discount_details?: {
    original_price: number;
    discount_percentage: number;
    discount_amount: number;
    final_price: number;
    remainingPoints?: number;
    membership_tier?: string;
  };
  details?: {
    price: number;
    seller_id: string;
    buyer_id: string;
    remainingPoints: number;
  };
}

export interface PurchaseHistoryItem {
  _id: string;
  marketplace_item_id: string;
  buyer_id: string;
  seller_id: string;
  price: number;
  purchased_at: string;
  item?: MarketplaceItem;
}

export interface SalesHistoryItem {
  _id: string;
  marketplace_item_id: string;
  buyer_id: string;
  seller_id: string;
  price: number;
  purchased_at: string;
  item?: MarketplaceItem;
}
