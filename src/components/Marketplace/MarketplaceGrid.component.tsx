import React from 'react';
import MarketplaceCard, { MarketplaceProduct } from './MarketplaceCard.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface MarketplaceGridProps {
    products: MarketplaceProduct[];
    isLoading?: boolean;
    onProductClick?: (product: MarketplaceProduct) => void;
    currentUserId?: string | null;
}

const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
    products,
    isLoading = false,
    onProductClick,
    currentUserId,
}) => {
    const { t } = useAppTranslate('marketplace');
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-96 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg font-medium">{t('no_products')}</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 animate-fade-in">
                {products.map((product, index) => (
                    <div key={product.id} style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                    }}>
                        <MarketplaceCard
                            product={product}
                            onClick={() => onProductClick?.(product)}
                            currentUserId={currentUserId}
                        />
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default MarketplaceGrid;
