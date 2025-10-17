import React from 'react';
import MarketplaceCard, { MarketplaceProduct } from './MarketplaceCard.component';

interface MarketplaceGridProps {
    products: MarketplaceProduct[];
    isLoading?: boolean;
    onProductClick?: (product: MarketplaceProduct) => void;
}

const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
    products,
    isLoading = false,
    onProductClick,
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-200 rounded-lg h-72 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 text-lg">Không có sản phẩm nào</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <MarketplaceCard
                    key={product.id}
                    product={product}
                    onClick={() => onProductClick?.(product)}
                />
            ))}
        </div>
    );
};

export default MarketplaceGrid;
