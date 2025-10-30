export interface CreatorInfo {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
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
  copied_data?: Record<string, any>;
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
  details: {
    price: number;
    seller_id: string;
    buyer_id: string;
    remainingPoints: number;
  };
}
