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
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ product, onClick, onFavoriteChange }) => {
        const { t } = useAppTranslate('marketplace');

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
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
        >
            {/* Favorite Button */}
            <button
                onClick={handleFavoriteClick}
                disabled={isToggling}
                className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all disabled:opacity-50"
                title={isFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
                {isToggling ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-5 h-5 transition-colors ${
                            isFavorited ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600'
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
            <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {/* Discount Badge */}
                {product.discount && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-semibold text-xs">
                        -{product.discount}%
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="p-5 flex flex-col gap-3.5">
                {/* Product Name & Price Row */}
                <div className="flex justify-between items-center gap-3">
                    <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 flex-1 min-w-0">
                        {product.name}
                    </h3>
                    <div className="text-right flex-shrink-0">
                        <span className="text-lg font-bold text-blue-600">
                            {discountedPrice === 0 ? t('free') : `${discountedPrice.toLocaleString()} OP`}
                        </span>
                        {product.discount && (
                            <div className="text-xs text-gray-400 line-through">
                                {product.price.toLocaleString()} OP
                            </div>
                        )}
                    </div>
                </div>

                {/* Seller Info */}
                <div className="flex items-center gap-2.5 py-3 border-t border-b border-gray-100">
                    <img
                        src={product.sellerInfo?.avatar_url || `https://ui-avatars.com/api/?name=${product.sellerInfo?.full_name || 'Unknown'}&background=random&size=32`}
                        alt={product.sellerInfo?.full_name || 'Seller'}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 flex items-center justify-between">
                        <p className="text-xs text-gray-600 flex-1">
                            <span className="font-medium text-gray-900">{product.sellerInfo?.full_name || product.sellerName}</span>
                        </p>
                        {product.isPurchased && (
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded ml-2">
                                {t('purchased')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Bottom Stats Row */}
                <div className="flex items-center justify-between text-xs">
                    {/* Purchase Count */}
                    <div className="flex items-center gap-1 text-gray-600">
                        <span>✓</span>
                        <span>{product.purchaseCount} {t('purchased')}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-gray-900 font-medium">
                            {product.rating.toFixed(1)}
                            {product.ratingCount && ` (${product.ratingCount})`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceCard;
