import React from 'react';
import Icon from '../common/Icon/Icon.component';
import { CreatorInfo } from '../../types/marketplace/marketplace.types';

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
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ product, onClick }) => {
    const discountedPrice = product.discount
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
        >
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
                            {discountedPrice === 0 ? 'Free' : `${discountedPrice.toLocaleString()} OP`}
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
                                Already Purchased
                            </span>
                        )}
                    </div>
                </div>

                {/* Bottom Stats Row */}
                <div className="flex items-center justify-between text-xs">
                    {/* Purchase Count */}
                    <div className="flex items-center gap-1 text-gray-600">
                        <span>✓</span>
                        <span>{product.purchaseCount} purchased</span>
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
