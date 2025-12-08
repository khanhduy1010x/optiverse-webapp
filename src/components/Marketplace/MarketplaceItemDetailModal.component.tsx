import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { formatPrice } from '../../utils/marketplace.transform';
import ConfirmDialog from './ConfirmDialog.component';
import ErrorModal from '../common/ErrorModal.component';
import MembershipUpgradeErrorModal from './MembershipUpgradeErrorModal.component';
import FlashcardPreviewModal from './FlashcardPreviewModal.component';
import { RatingForm } from './RatingForm.component';
import { RatingList } from './RatingList.component';
import { scrollbarHideStyle } from './styles/MarketplaceItemDetailModal.styles';
import { useMarketplaceItemDetailModal } from '../../hooks/marketplace/useMarketplaceItemDetailModal';
import marketplaceService from '../../services/marketplace.service';
import { PriceDisplay } from './PriceDisplay.component';
import { useToggleFavorite } from '../../hooks/marketplace/useToggleFavorite';
import { useFavoriteStatus } from '../../hooks/marketplace/useFavoriteStatus';
import { useFollowCreator } from '../../hooks/marketplace/useFollowCreator';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface MarketplaceItemDetailModalProps {
    item: MarketplaceItem | null;
    isOpen: boolean;
    onClose: () => void;
    onPurchaseSuccess?: () => void;
    onFavoriteChange?: () => void;
}

const MarketplaceItemDetailModal: React.FC<MarketplaceItemDetailModalProps> = ({
    item,
    isOpen,
    onClose,
    onPurchaseSuccess,
    onFavoriteChange,
}) => {
    const [displayItem, setDisplayItem] = useState<MarketplaceItem | null>(item);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [purchasePrice, setPurchasePrice] = useState<number | null>(null);
    const [purchaseTitle, setPurchaseTitle] = useState<string>('');
    const [showMembershipUpgradeError, setShowMembershipUpgradeError] = useState(false);

    const { t } = useAppTranslate('marketplace');

    const {
        selectedImageIndex,
        setSelectedImageIndex,
        showConfirmation,
        setShowConfirmation,
        showErrorDialog,
        setShowErrorDialog,
        showPreview,
        setShowPreview,
        ratingRefreshKey,
        refreshRatingKey,
        mainImage,
        isPurchasing,
        error,
        errorCode,
        setError,
        handlePurchase,
        flashcards,
        totalFlashcards,
        previewCount,
        previewLoading,
        ratingStats,
        refreshRatingStats,
        handlePreviewClick,
        handlePurchaseClick,
        pricingInfo,
    } = useMarketplaceItemDetailModal({
        item: displayItem || item,
        isOpen,
        onPurchaseSuccess: async () => {
            // Fetch fresh item data to update is_purchased
            if (item) {
                try {
                    const freshItem = await marketplaceService.getById(item._id);
                    setDisplayItem(freshItem);
                } catch (err) {
                    console.error('Error fetching fresh item:', err);
                }
            }
            onPurchaseSuccess?.();
        },
    });

    // Fetch detailed item data with pricing when modal opens
    useEffect(() => {
        if (isOpen && item && !isLoadingDetails) {
            const fetchDetailedItem = async () => {
                try {
                    setIsLoadingDetails(true);
                    const detailedItem = await marketplaceService.getById(item._id);
                    setDisplayItem(detailedItem);
                } catch (err) {
                    console.error('Error fetching detailed item:', err);
                    // Fallback to the item from props if fetch fails
                    setDisplayItem(item);
                } finally {
                    setIsLoadingDetails(false);
                }
            };
            fetchDetailedItem();
        }
    }, [isOpen, item?._id]);

    // Update display item when item changes (for non-detailed updates)
    useEffect(() => {
        if (item && !isLoadingDetails) {
            setDisplayItem(item);
        }
    }, [item?.title]); // Only re-set if title changes (indicates different item)

    // Update purchase price when showConfirmation changes
    useEffect(() => {
        if (showConfirmation && displayItem) {
            // Use displayItem pricing if available, otherwise use item price
            const price = displayItem.pricing?.final_price ?? displayItem.price ?? item?.price ?? 0;
            const title = displayItem.title || item?.title || t('unknown_item');
            setPurchasePrice(price);
            setPurchaseTitle(title);
        }
    }, [showConfirmation, displayItem?.pricing, displayItem?.title, item?.title]);

    // Detect membership upgrade error and show special modal
    useEffect(() => {
        // Error code 1213 = MARKETPLACE_BUY_LIMIT_EXCEEDED
        if (errorCode === 1213) {
            setShowMembershipUpgradeError(true);
            setShowErrorDialog(false);
        }
    }, [errorCode]);
    // Favorite functionality
    const { isFavorited, setIsFavorited } = useFavoriteStatus(item?._id || null);
    const { isToggling, toggleFavorite } = useToggleFavorite(
        isFavorited,
        (newStatus) => {
            setIsFavorited(newStatus);
            onFavoriteChange?.();
        }
    );

    // Follow creator functionality
    const { isFollowing, isLoading: isFollowLoading, toggleFollow } = useFollowCreator(item?.creator_id || null);

    const handleFavoriteClick = async () => {
        if (item) {
            await toggleFavorite(item._id);
        }
    };

    if (!isOpen || !item) {
        return null;
    }

    return (
        <>
            <style>{scrollbarHideStyle}</style>
            <style>{`
                .description-content h1 {
                    font-size: 1.875rem;
                    font-weight: bold;
                    margin: 1rem 0;
                    color: #111827;
                }
                .description-content h2 {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0.875rem 0;
                    color: #111827;
                }
                .description-content h3 {
                    font-size: 1.25rem;
                    font-weight: bold;
                    margin: 0.75rem 0;
                    color: #111827;
                }
                .description-content p {
                    margin-bottom: 0.75rem;
                    color: #374151;
                }
                .description-content strong {
                    font-weight: 600;
                    color: #111827;
                }
                .description-content em {
                    font-style: italic;
                }
                .description-content ul, .description-content ol {
                    margin: 0.5rem 0;
                    padding-left: 1.5rem;
                }
                .description-content li {
                    margin: 0.25rem 0;
                    color: #374151;
                }
                .description-content blockquote {
                    border-left: 4px solid #e5e7eb;
                    padding-left: 1rem;
                    margin: 1rem 0;
                    font-style: italic;
                    color: #6b7280;
                }
            `}</style>
            <Modal
                isOpen={isOpen}
                onRequestClose={onClose}
                className="marketplace-modal fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1100px] max-w-[95vw] max-h-[92vh] overflow-hidden bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
                overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000]"
                style={{
                    content: {
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[92vh]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                        
                        {/* LEFT SECTION - Images */}
                        <div className="animate-fade-in">
                            {/* Main Image */}
                            <div className="image-container mb-4 h-96 bg-gray-100">
                                <img
                                    src={mainImage}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Image Thumbnails */}
                            {item.images && item.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {item.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                                                selectedImageIndex === index
                                                    ? 'border-sky-500 ring-2 ring-sky-200'
                                                    : 'border-gray-200 hover:border-sky-300'
                                            }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`Preview ${index}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT SECTION - Details */}
                        <div className="animate-slide-up flex flex-col">
                            {/* Header with Favorite Button */}
                            <div className="mb-6">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900 flex-1">
                                        {item.title}
                                    </h1>
                                    <button
                                        onClick={handleFavoriteClick}
                                        disabled={isToggling}
                                        className="shrink-0 bg-gray-100 hover:bg-gray-200 rounded-full p-3 transition-all disabled:opacity-50 mr-8"
                                        title={isFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                                    >
                                        {isToggling ? (
                                            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`w-6 h-6 transition-colors ${
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
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                        ★ {ratingStats?.averageRating?.toFixed(1) || '0'}
                                        <span className="text-gray-400">
                                            ({ratingStats?.totalRatings || 0} reviews)
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Price Badge */}
                            {item.price === 0 ? (
                                <div className="badge-primary rounded-xl p-4 mb-6 text-white">
                                    <div className="text-xs font-medium opacity-90 mb-1">PRICE</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-3xl font-bold">Free</div>
                                        <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                                            FREE
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <PriceDisplay
                                        originalPrice={item.price}
                                        pricing={item.pricing}
                                        showBreakdown={true}
                                    />
                                </div>
                            )}

                            {/* Quick Stats */}
                            <div className="bg-gray-100 rounded-lg p-4 mb-6">
                                <div className="text-xs text-gray-600 font-medium">Purchased</div>
                                <div className="text-3xl font-bold text-gray-900 mt-2">
                                    {item.purchase_count || 0}
                                </div>
                            </div>

                            {/* Seller Info */}
                            <div className="bg-gray-100 rounded-lg p-4 mb-6">
                                <div className="text-xs font-medium text-gray-600 mb-3">Seller</div>
                                <div className="flex items-center gap-3 justify-between">
                                    <div className="flex items-center gap-3">
                                        <img
                                        src={item.creator_info?.avatar_url || `https://ui-avatars.com/api/?name=${item.creator_info?.full_name || t('unknown_user')}&background=0ea5e9&color=fff&size=48`}
                                            alt={item.creator_info?.full_name || 'Seller'}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                            {item.creator_info?.full_name || t('unknown_user')}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                            {item.creator_info?.email || t('no_email')}
                                            </p>
                                        </div>
                                    </div>
                                    {(() => {
                                        const currentUserId = localStorage.getItem('user_id');
                                        const isOwnItem = item?.creator_id === currentUserId;
                                        
                                        if (isOwnItem) {
                                            return null; // Don't show follow button for own items
                                        }
                                        
                                        return (
                                            <button
                                                onClick={toggleFollow}
                                                disabled={isFollowLoading}
                                                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                                                    isFollowing
                                                        ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {isFollowLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                                            </button>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Description */}
                            {item.description && (
                                <div className="mb-6">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">{t('description_label')}</p>
                                    <div
                                        dangerouslySetInnerHTML={{ __html: item.description }}
                                        className="description-content text-sm text-gray-700 leading-relaxed"
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                {(() => {
                                    const currentItem = displayItem || item;
                                    const userId = localStorage.getItem('user_id');
                                    const isOwner = currentItem?.creator_id === userId;
                                    
                                    return (
                                        <>
                                            <button
                                                onClick={handlePreviewClick}
                                                className="btn-secondary py-2.5 rounded-lg text-sm font-semibold transition-all"
                                            >
                                                  {t('preview_button')}

                                            </button>
                                            {currentItem?.is_purchased ? (
                                                <button
                                                    disabled
                                                    className="btn-secondary py-2.5 rounded-lg text-gray-700 text-sm font-semibold transition-all bg-gray-100 cursor-not-allowed"
                                                >
                                        ✓ {t('already_purchased')}
                                                </button>
                                            ) : isOwner ? (
                                                <button
                                                    disabled
                                                    className="btn-secondary py-2.5 rounded-lg text-gray-700 text-sm font-semibold transition-all bg-gray-100 cursor-not-allowed"
                                                >
                                                    Your Item
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handlePurchaseClick}
                                                    disabled={isPurchasing}
                                                    className="btn-primary py-2.5 rounded-lg text-white text-sm font-semibold transition-all disabled:opacity-50"
                                                >
                                        {isPurchasing ? t('processing') : item.price === 0 ? t('get_free_button') : t('buy_now_button')}
                                                </button>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section - Full Width Below */}
                    <div className="px-8 pb-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 my-8">{t('reviews_ratings')}</h2>
                        
                        <div className="space-y-8">
                            {/* Rating Form */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <RatingForm
                                    key={ratingRefreshKey}
                                    marketplaceId={item._id}
                                    onRatingCreated={() => {
                                        refreshRatingKey();
                                        refreshRatingStats();
                                    }}
                                    onRatingUpdated={() => {
                                        refreshRatingKey();
                                        refreshRatingStats();
                                    }}
                                />
                            </div>

                            {/* Rating List */}
                            <div>
                                <RatingList
                                    key={`ratings-${ratingRefreshKey}`}
                                    marketplaceId={item._id}
                                    onRatingDeleted={() => {
                                        refreshRatingKey();
                                        refreshRatingStats();
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            {/* Confirmation Modal */}
            <ConfirmDialog
                isOpen={showConfirmation}
                title="Confirm Purchase"
                message={`Are you sure you want to ${(displayItem?.price ?? item?.price) === 0 ? 'get this free item' : `purchase "${purchaseTitle || displayItem?.title || item?.title || 'this item'}" for ${purchasePrice ?? displayItem?.pricing?.final_price ?? displayItem?.price ?? item?.price} OP`}?`}
                confirmButtonText={(displayItem?.price ?? item?.price) === 0 ? '✓ Get Free' : '✓ Purchase'}
                cancelButtonText="✕ Cancel"
                isLoading={isPurchasing}
                pricing={displayItem?.pricing || undefined}
                onConfirm={async () => {
                    setShowConfirmation(false);
                    await handlePurchase(item!._id);
                }}
                onCancel={() => setShowConfirmation(false)}
            />

            {/* Error Modal */}
            <ErrorModal
                isOpen={showErrorDialog && !!error}
                message={error || 'An error occurred during purchase. Please try again.'}
                onClose={() => {
                    setShowErrorDialog(false);
                    setError(null);
                }}
                autoCloseMs={3000}
            />

            {/* Membership Upgrade Error Modal */}
            <MembershipUpgradeErrorModal
                isOpen={showMembershipUpgradeError}
                message={error || 'Bạn cần nâng cấp gói để có thể mua thêm'}
                onClose={() => {
                    setShowMembershipUpgradeError(false);
                    setError(null);
                }}
                autoCloseMs={0}
            />

            {/* Flashcard Preview Modal */}
            <FlashcardPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                flashcards={flashcards}
                totalFlashcards={totalFlashcards}
                previewCount={previewCount}
                itemTitle={item?.title || 'Preview'}
                loading={previewLoading}
            />
        </Modal>
        </>
    );
};

export default MarketplaceItemDetailModal;