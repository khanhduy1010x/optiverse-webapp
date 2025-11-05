import React, { useState } from 'react';
import { useFavorites } from '../../hooks/marketplace/useFavorites';
import MarketplaceGrid from '../../components/Marketplace/MarketplaceGrid.component';
import MarketplaceItemDetailModal from '../../components/Marketplace/MarketplaceItemDetailModal.component';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { MarketplaceProduct } from '../../components/Marketplace/MarketplaceCard.component';
import { transformItemsToProductsWithRatings } from '../../utils/marketplace.transform';

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
                    <p className="text-gray-500 text-lg">Đang tải danh sách yêu thích...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{scrollbarHideStyle}</style>
            <div className="favorites-page min-h-screen bg-gray-50">
                {/* Header Section */}
                <div className="bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 fill-red-500 text-red-500"
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
                        <h1 className="text-3xl font-bold text-gray-900">Yêu thích của tôi</h1>
                    </div>
                    <p className="text-gray-600 mt-1">
                        Danh sách các sản phẩm bạn đã lưu vào yêu thích
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {products.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-24 h-24 mx-auto text-gray-300 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <p className="text-gray-600 text-lg mb-4">
                                Bạn chưa có sản phẩm yêu thích nào
                            </p>
                            <p className="text-gray-500 mb-6">
                                Khám phá marketplace và thêm sản phẩm vào yêu thích để xem sau
                            </p>
                            <a
                                href="/marketplace"
                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                                Khám phá Marketplace
                            </a>
                        </div>
                    ) : (
                        <>
                            <MarketplaceGrid
                                products={products}
                                onProductClick={(product) => {
                                    const item = items.find(i => i._id === product.id);
                                    if (item) {
                                        setSelectedItem(item);
                                    }
                                }}
                            />

                            {/* Pagination */}
                            {products.length > 0 && (
                                <div className="mt-8 flex justify-center items-center gap-4">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition"
                                    >
                                        Trang trước
                                    </button>
                                    <span className="text-gray-700 font-medium">
                                        Trang {page}
                                    </span>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={products.length < 10}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition"
                                    >
                                        Trang sau
                                    </button>
                                </div>
                            )}
                        </>
                    )}
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
