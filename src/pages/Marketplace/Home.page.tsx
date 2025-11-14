import React, { useState, useEffect } from 'react';
import MarketplaceGrid from '../../components/Marketplace/MarketplaceGrid.component';
import MarketplaceFilterBar from '../../components/Marketplace/MarketplaceFilterBar.component';
import MarketplaceItemDetailModal from '../../components/Marketplace/MarketplaceItemDetailModal.component';
import SuccessNotificationModal from '../../components/Marketplace/SuccessNotificationModal.component';
import PaginationControl from '../../components/Marketplace/PaginationControl.component';
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
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [products, setProducts] = useState<MarketplaceProduct[]>([]);
    const [isTransforming, setIsTransforming] = useState(false);
    
    // Get current user ID from localStorage
    const currentUserId = localStorage.getItem('user_id');
    // Fetch items from hook
    const { items, loading, error, page, setPage, refetch, total } = useMarketplaceItems(currentUserId);
    
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

    const totalPages = Math.ceil(total / 12);

    return (
        <>
            <style>{scrollbarHideStyle}</style>
            <div className="marketplace-page min-h-screen bg-white">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-8 md:py-10">
                <div className="max-w-[2000px] mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Marketplace</h1>
                    <p className="text-gray-500 mt-3 text-lg">
                        Discover and collect flashcards from the community
                    </p>
                </div>
            </div>

            {/* Enhanced Filter Bar */}
            <div className="border-b border-gray-100">
                <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <MarketplaceFilterBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        popularity={popularity}
                        onPopularityChange={setPopularity}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                    />
                </div>
            </div>

            {/* Products Grid Section */}
            <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="max-w-[2000px] mx-auto px-0">
                {loading || isTransforming ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="text-center">
                            <div className="w-10 h-10 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 text-lg">Loading data...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="text-center">
                            <p className="text-red-500 text-lg font-medium">⚠️ {error}</p>
                        </div>
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
                            currentUserId={currentUserId}
                        />
                        {/* Pagination */}
                        {total > 12 && (
                            <div className="mt-16">
                                <PaginationControl
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            </div>
                        )}
                    </>
                )}
                </div>
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
