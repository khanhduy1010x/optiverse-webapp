import React, { useState, useEffect } from 'react';
import MarketplaceGrid from '../../components/Marketplace/MarketplaceGrid.component';
import MarketplaceFilterBar from '../../components/Marketplace/MarketplaceFilterBar.component';
import MarketplaceItemDetailModal from '../../components/Marketplace/MarketplaceItemDetailModal.component';
import SuccessNotificationModal from '../../components/Marketplace/SuccessNotificationModal.component';
import { useMarketplaceItems } from '../../hooks/marketplace/useMarketplaceItems';
import { useMarketplaceFilter } from '../../hooks/marketplace/useMarketplaceFilter';
import { usePurchaseMarketplace } from '../../hooks/marketplace/usePurchaseMarketplace';
import { transformItemsToProductsWithRatings } from '../../utils/marketplace.transform';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { MarketplaceProduct } from '../../components/Marketplace/MarketplaceCard.component';

// Hide scrollbar style
const scrollbarHideStyle = `
    .marketplace-page::-webkit-scrollbar {
        display: none;
    }
    .marketplace-page {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;

const MarketplaceHomePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [popularity, setPopularity] = useState('all');
    const [category, setCategory] = useState('all');
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [products, setProducts] = useState<MarketplaceProduct[]>([]);
    const [isTransforming, setIsTransforming] = useState(false);
    
    // Get current user ID from localStorage
    const currentUserId = localStorage.getItem('user_id');
    // Fetch items from hook
    const { items, loading, error, page, setPage, refetch } = useMarketplaceItems(currentUserId);
    
    // Transform items to products with ratings
    useEffect(() => {
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
    
    // Apply filters and sorting
    const filteredProducts = useMarketplaceFilter(products, {
        searchQuery,
        sortBy,
        priceRange,
        popularity,
    });

    // Use purchase hook
    const { isPurchasing, handlePurchase, lastPurchaseDiscount } = usePurchaseMarketplace(
        () => {
            // On success
            setSelectedItem(null);
            setShowSuccessNotification(true);
            // Refetch marketplace items and user balance
            refetch();
        }
    );

    return (
        <>
            <style>{scrollbarHideStyle}</style>
            <div className="marketplace-page min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 p-6">
                <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
                <p className="text-gray-600 mt-1">
                    Discover flashcards from the community
                </p>
            </div>

            {/* Enhanced Filter Bar */}
            <MarketplaceFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                popularity={popularity}
                onPopularityChange={setPopularity}
                category={category}
                onCategoryChange={setCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            {/* Products Grid Section */}
            <div className="p-6">
                {loading || isTransforming ? (
                    <div className="flex justify-center items-center h-96">
                        <p className="text-gray-500">Loading data...</p>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-96">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : (
                    <>
                        <MarketplaceGrid
                            products={filteredProducts}
                            onProductClick={(product) => {
                                const item = items.find(i => i._id === product.id);
                                if (item) {
                                    setSelectedItem(item);
                                }
                            }}
                        />
                        {/* Pagination */}
                        <div className="mt-8 flex justify-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">{page}</span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={items.length < 10}
                                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Detail Modal */}
            <MarketplaceItemDetailModal
                item={selectedItem}
                isOpen={selectedItem !== null}
                onClose={() => setSelectedItem(null)}
                onPurchaseSuccess={() => {
                    setShowSuccessNotification(true);
                    refetch();
                }}
                onFavoriteChange={() => {
                    // No need to refetch here as favorite doesn't affect main list
                }}
            />

            {/* Success Notification Modal */}
            <SuccessNotificationModal
                isOpen={showSuccessNotification}
                onClose={() => setShowSuccessNotification(false)}
                title="Purchase Successful"
                message="Your flashcard deck has been added to your collection!"
                discountDetails={lastPurchaseDiscount || undefined}
            />
        </div>
        </>
    );
};

export default MarketplaceHomePage;
