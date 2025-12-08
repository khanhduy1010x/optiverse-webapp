import React, { useState } from 'react';
import { useFavorites } from '../../hooks/marketplace/useFavorites';
import MarketplaceGrid from '../../components/Marketplace/MarketplaceGrid.component';
import MarketplaceItemDetailModal from '../../components/Marketplace/MarketplaceItemDetailModal.component';
import PaginationControl from '../../components/Marketplace/PaginationControl.component';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { MarketplaceProduct } from '../../components/Marketplace/MarketplaceCard.component';
import { transformItemsToProductsWithRatings } from '../../utils/marketplace.transform';
import { useAppTranslate } from '../../hooks/useAppTranslate';

// Hide scrollbar style
const scrollbarHideStyle = `
    .favorites-page::-webkit-scrollbar {
        display: none;
    }
    .favorites-page {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;

const FavoritesPage: React.FC = () => {
    const { t } = useAppTranslate('marketplace');
    const { items, loading, error, page, setPage, refetch } = useFavorites();
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
    const [products, setProducts] = useState<MarketplaceProduct[]>([]);
    const [isTransforming, setIsTransforming] = React.useState(false);

    // Transform items to products with ratings
    React.useEffect(() => {
        const fetchProductsWithRatings = async () => {
            if (items.length > 0) {
                setIsTransforming(true);
                try {
                    const productsWithRatings = await transformItemsToProductsWithRatings(items);
                    setProducts(productsWithRatings);
                } catch (error) {
                    console.error('Error transforming items:', error);
                    setProducts([]);
                } finally {
                    setIsTransforming(false);
                }
            } else {
                setProducts([]);
            }
        };

        fetchProductsWithRatings();
    }, [items]);

    const handleFavoriteChange = () => {
        // Refetch favorites when a favorite is removed
        refetch();
    };

    if (loading || isTransforming) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 text-lg">{t('loading_favorites')}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{scrollbarHideStyle}</style>
            <div className="favorites-page min-h-screen bg-white">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
                    <div>
                        <h1 className="text-5xl font-bold tracking-tight text-gray-900">{t('my_favorites')}</h1>
                        <p className="text-gray-500 mt-2 text-base">
                            {t('favorites_description')}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
                    <div>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {products.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 text-center">
                                <p className="text-gray-500 mb-4 text-lg">{t('no_favorites')}</p>
                                <a
                                    href="/marketplace"
                                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    {t('explore_marketplace')}
                                </a>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                                    {products.map((product, idx) => {
                                        const item = items.find(i => i._id === product.id);
                                        return (
                                            <div
                                                key={product.id}
                                                className="bg-white rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-fade-in cursor-pointer"
                                                style={{ animationDelay: `${idx * 50}ms` }}
                                                onClick={() => {
                                                    if (item) setSelectedItem(item);
                                                }}
                                            >
                                                {/* Image */}
                                                <div className="relative h-56 bg-gray-100 overflow-hidden">
                                                    <img
                                                        src={product.image || 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="p-4">
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                                                        {product.title}
                                                    </h3>
                                                    <div className="text-gray-600 text-xs mb-3 line-clamp-2">
                                                        {item?.description ? (
                                                            <div dangerouslySetInnerHTML={{ __html: item.description }} />
                                                        ) : (
                                                            <p className="text-gray-400">{t('no_description_text')}</p>
                                                        )}
                                                    </div>

                                                    {/* Price */}
                                                    <div className="mb-4 pb-4 border-b border-gray-100">
                                                        {product.price > 0 ? (
                                                            <p className="text-xl font-bold text-blue-600">
                                                                {product.price} <span className="text-xs font-normal text-gray-600">OP</span>
                                                            </p>
                                                        ) : (
                                                            <p className="text-lg font-bold text-gray-900">{t('free')}</p>
                                                        )}
                                                    </div>

                                                    {/* Rating */}
                                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                                        <span>★ {product.rating || '0'}</span>
                                                        <span>{product.reviews || 0} {t('reviews_text')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {products.length > 0 && (
                                    <div className="mt-12 flex justify-center">
                                        <PaginationControl
                                            currentPage={page}
                                            totalPages={Math.ceil(items.length / 12) || 1}
                                            onPageChange={setPage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Detail Modal */}
                {selectedItem && (
                    <MarketplaceItemDetailModal
                        item={selectedItem}
                        isOpen={!!selectedItem}
                        onClose={() => setSelectedItem(null)}
                        onPurchaseSuccess={() => {
                            setSelectedItem(null);
                            refetch();
                        }}
                        onFavoriteChange={handleFavoriteChange}
                    />
                )}
            </div>
        </>
    );
};

export default FavoritesPage;
