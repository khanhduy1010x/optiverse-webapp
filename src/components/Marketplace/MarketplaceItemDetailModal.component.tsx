import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { formatPrice } from '../../utils/marketplace.transform';
import ConfirmDialog from './ConfirmDialog.component';
import ErrorModal from '../common/ErrorModal.component';
import FlashcardPreviewModal from './FlashcardPreviewModal.component';
import { RatingForm } from './RatingForm.component';
import { RatingList } from './RatingList.component';
import { scrollbarHideStyle } from './MarketplaceItemDetailModal.styles';
import { useMarketplaceItemDetailModal } from '../../hooks/marketplace/useMarketplaceItemDetailModal';

interface MarketplaceItemDetailModalProps {
    item: MarketplaceItem | null;
    isOpen: boolean;
    onClose: () => void;
    onPurchaseSuccess?: () => void;
}

const MarketplaceItemDetailModal: React.FC<MarketplaceItemDetailModalProps> = ({
    item,
    isOpen,
    onClose,
    onPurchaseSuccess,
}) => {
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
    } = useMarketplaceItemDetailModal({
        item,
        isOpen,
        onPurchaseSuccess,
    });

    if (!isOpen || !item) {
        return null;
    }

    return (
        <>
            <style>{scrollbarHideStyle}</style>
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
                            {/* Header */}
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {item.title}
                                </h1>
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
                            <div className="badge-primary rounded-xl p-4 mb-6 text-white">
                                <div className="text-xs font-medium opacity-90 mb-1">PRICE</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold">
                                        {item.price === 0 ? 'Free' : `${item.price} OP`}
                                    </div>
                                    {item.price === 0 && (
                                        <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                                            FREE
                                        </span>
                                    )}
                                </div>
                            </div>

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
                                <div className="flex items-center gap-3">
                                    <img
                                        src={item.creator_info?.avatar_url || `https://ui-avatars.com/api/?name=${item.creator_info?.full_name || 'Unknown'}&background=0ea5e9&color=fff&size=48`}
                                        alt={item.creator_info?.full_name || 'Seller'}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {item.creator_info?.full_name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {item.creator_info?.email || 'No email'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {item.description && (
                                <div className="mb-6">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">DESCRIPTION</p>
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                                        {item.description}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button
                                    onClick={handlePreviewClick}
                                    className="btn-secondary py-2.5 rounded-lg text-sm font-semibold transition-all"
                                >
                                    👁️ Preview
                                </button>
                                {item.is_purchased ? (
                                    <button
                                        disabled
                                        className="btn-secondary py-2.5 rounded-lg text-gray-700 text-sm font-semibold transition-all bg-gray-100 cursor-not-allowed"
                                    >
                                        ✓ Already Purchased
                                    </button>
                                ) : (
                                    <button
                                        onClick={handlePurchaseClick}
                                        disabled={isPurchasing}
                                        className="btn-primary py-2.5 rounded-lg text-white text-sm font-semibold transition-all disabled:opacity-50"
                                    >
                                        {isPurchasing ? 'Processing...' : item.price === 0 ? 'Get Free' : 'Buy Now'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section - Full Width Below */}
                    <div className="px-8 pb-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 my-8">Reviews & Ratings</h2>
                        
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
                message={`Are you sure you want to ${item.price === 0 ? 'get this free item' : `purchase "${item.title}" for ${item.price} OP`}?`}
                confirmButtonText={item.price === 0 ? '✓ Get Free' : '✓ Purchase'}
                cancelButtonText="✕ Cancel"
                isLoading={isPurchasing}
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
