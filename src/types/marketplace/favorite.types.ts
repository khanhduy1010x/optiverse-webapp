// Types for Marketplace Favorites
export interface FavoriteItem {
  _id: string;
  user_id: string;
  marketplace_item_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ToggleFavoritePayload {
  marketplace_item_id: string;
}

export interface ToggleFavoriteResponse {
  isFavorited: boolean;
  message: string;
}

export interface FavoriteCountResponse {
  count: number;
}
