import React from 'react';
import Icon from '../common/Icon/Icon.component';

export interface MarketplaceProduct {
    id: string;
    name: string;
    image: string;
    price: number;
    discount?: number;
    seller: string;
    purchaseCount: number;
    rating: number;
    ratingCount?: number;
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
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
            {/* Image Container */}
            <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {/* Discount Badge */}
                {product.discount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md font-semibold text-sm">
                        -{product.discount}%
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="p-4 flex flex-col gap-3">
                {/* Product Name */}
                <h3 className="font-semibold text-base line-clamp-2 text-gray-800">
                    {product.name}
                </h3>

                {/* Price Section */}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                        {discountedPrice.toLocaleString()} OP
                    </span>
                    {product.discount && (
                        <span className="text-sm text-gray-500 line-through">
                            {product.price.toLocaleString()} OP
                        </span>
                    )}
                </div>

                {/* Seller Info */}
                <div className="text-xs text-gray-600">
                    <p>Người đăng: <span className="font-medium">{product.seller}</span></p>
                </div>

                {/* Bottom Stats Row */}
                <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                    {/* Purchase Count */}
                    <div className="flex items-center gap-1">
                        <Icon name="check" size={14} className="text-gray-500" />
                        <span>{product.purchaseCount} mua</span>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Icon
                                    key={i}
                                    name="star"
                                    size={14}
                                    className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                                />
                            ))}
                        </div>
                        <span className="text-gray-600">
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
