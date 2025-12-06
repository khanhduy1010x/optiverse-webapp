import React, { useState } from 'react';
import MarketplaceGrid from '../../components/Marketplace/MarketplaceGrid.component';
import MarketplaceFilterBar from '../../components/Marketplace/MarketplaceFilterBar.component';
import MarketplaceItemDetailModal from '../../components/Marketplace/MarketplaceItemDetailModal.component';
import SuccessNotificationModal from '../../components/Marketplace/SuccessNotificationModal.component';
import PaginationControl from '../../components/Marketplace/PaginationControl.component';
import { useMarketplaceFilter } from '../../hooks/marketplace/useMarketplaceFilter';
import { useMarketplaceSearch } from '../../hooks/marketplace/useMarketplaceSearch';
import { usePurchaseMarketplace } from '../../hooks/marketplace/usePurchaseMarketplace';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { MarketplaceProduct } from '../../components/Marketplace/MarketplaceCard.component';
import marketplaceService from '../../services/marketplace.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

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
    const [searchInput, setSearchInput] = useState('');
    const { t } = useAppTranslate('marketplace');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    
    // Get current user ID from localStorage
    const currentUserId = localStorage.getItem('user_id');
    
    // Use marketplace search hook
    const { products, loading, error, total, totalPages, currentPage, setCurrentPage } = useMarketplaceSearch({
        searchQuery,
        priceRange,
        sortBy,
    });
    
    // Handle search button click
    const handleSearch = () => {
        setSearchQuery(searchInput);
    };
    
    // Handle search input enter key
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    
    // Apply client-side sorting only (backend filtering + pagination already applied)
    const filteredProducts = useMarketplaceFilter(products, {
        searchQuery: '', // Already filtered on backend
        sortBy,
        priceRange: { min: 0, max: 9999999 }, // Already filtered on backend
    });

    // Use purchase hook
    const { isPurchasing, handlePurchase, lastPurchaseDiscount } = usePurchaseMarketplace(
        () => {
            // On success
            setSelectedItem(null);
            setShowSuccessNotification(true);
        }
    );

    // Handle product click - fetch full details
    const handleProductClick = async (product: MarketplaceProduct) => {
        try {
            console.log('Clicking product:', product);
            const fullItem = await marketplaceService.getById(product.id);
            console.log('Fetched item:', fullItem);
            setSelectedItem(fullItem);
            console.log('Selected item set to:', fullItem);
        } catch (err) {
            console.error('Error fetching product details:', err);
        }
    };

    return (
        <>
            <style>{scrollbarHideStyle}</style>
            <div className="marketplace-page min-h-screen bg-white">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-8 md:py-10">
                <div className="max-w-[2000px] mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Marketplace</h1>
                    <p className="text-gray-500 mt-3 text-lg">
                        {t('discover_subtitle')}
                    </p>
                </div>
            </div>

            {/* Enhanced Filter Bar */}
            <div className="border-b border-gray-100">
                <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <MarketplaceFilterBar
                        searchInput={searchInput}
                        onSearchInputChange={setSearchInput}
                        onSearchSubmit={handleSearch}
                        onSearchKeyPress={handleSearchKeyPress}
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                    />
                </div>
            </div>

            {/* Products Grid Section */}
            <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="max-w-[2000px] mx-auto px-0">
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="text-center">
                            <div className="w-10 h-10 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 text-lg">{t('loading_data')}</p>
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
                            onProductClick={handleProductClick}
                            currentUserId={currentUserId}
                        />
                        {/* Pagination */}
                        {total > 12 && (
                            <div className="mt-16">
                                <PaginationControl
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
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
