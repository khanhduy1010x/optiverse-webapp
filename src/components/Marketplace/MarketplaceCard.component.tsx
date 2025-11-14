import React from 'react';
import Icon from '../common/Icon/Icon.component';
import { CreatorInfo } from '../../types/marketplace/marketplace.types';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { useToggleFavorite } from '../../hooks/marketplace/useToggleFavorite';
import { useFavoriteStatus } from '../../hooks/marketplace/useFavoriteStatus';

export interface MarketplaceProduct {
    id: string;
    name: string;
    image: string;
    price: number;
    discount?: number;
    sellerName: string;
    sellerInfo?: CreatorInfo;
    creatorId?: string;
    purchaseCount: number;
    rating: number;
    ratingCount?: number;
    description?: string;
    isPurchased?: boolean;
}

interface MarketplaceCardProps {
    product: MarketplaceProduct;
    onClick?: () => void;
    onFavoriteChange?: () => void;
    currentUserId?: string | null;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ product, onClick, onFavoriteChange, currentUserId }) => {
        const { t } = useAppTranslate('marketplace');
        const isCreator = currentUserId && product.creatorId === currentUserId;

    const discountedPrice = product.discount
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

    // Check favorite status
    const { isFavorited, setIsFavorited } = useFavoriteStatus(product.id);
    const { isToggling, toggleFavorite } = useToggleFavorite(
        isFavorited,
        (newStatus) => {
            setIsFavorited(newStatus);
            onFavoriteChange?.();
        }
    );

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn click vào card
        await toggleFavorite(product.id);
    };

    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200/50 overflow-hidden hover:border-gray-300/80 h-full flex flex-col"
        >
            {/* Favorite Button */}
            <button
                onClick={handleFavoriteClick}
                disabled={isToggling}
                className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 hover:scale-110"
                title={isFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
                {isToggling ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-5 h-5 transition-all duration-200 ${
                            isFavorited ? 'fill-red-500 text-red-500 scale-110' : 'fill-none text-gray-500 hover:text-red-500'
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                )}
            </button>

            {/* Image Container */}
            <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                {/* Discount Badge */}
                {product.discount && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3.5 py-1.5 rounded-full font-bold text-sm shadow-lg">
                        Save {product.discount}%
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Product Name */}
                <div>
                    <h3 className="font-semibold text-base line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                        {product.name}
                    </h3>
                </div>

                {/* Seller Info */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <img
                        src={product.sellerInfo?.avatar_url || `https://ui-avatars.com/api/?name=${product.sellerInfo?.full_name || 'Unknown'}&background=random&size=40`}
                        alt={product.sellerInfo?.full_name || 'Seller'}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {product.sellerInfo?.full_name || product.sellerName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {isCreator && (
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                    ★ You
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs text-gray-600 pb-4 border-b border-gray-100">
                    {/* Purchase Count */}
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-gray-700">{product.purchaseCount}</span>
                        <span>purchased</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="font-semibold text-gray-900">
                            {product.rating.toFixed(1)}
                        </span>
                        {product.ratingCount && (
                            <span className="text-gray-400">({product.ratingCount})</span>
                        )}
                    </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-end justify-between gap-3 pt-2">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">
                            {discountedPrice === 0 ? (
                                <span className="text-green-600">{t('free')}</span>
                            ) : (
                                <span>{discountedPrice.toLocaleString()} <span className="text-base font-semibold text-gray-500">OP</span></span>
                            )}
                        </div>
                        {product.discount && (
                            <div className="text-xs text-gray-400 line-through mt-1">
                                {product.price.toLocaleString()} OP
                            </div>
                        )}
                    </div>
                    {product.isPurchased && (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                            ✓ Owned
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketplaceCard;
