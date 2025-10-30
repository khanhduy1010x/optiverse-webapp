import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { formatPrice } from '../../utils/marketplace.transform';
import ConfirmDialog from './ConfirmDialog.component';
import ErrorModal from '../common/ErrorModal.component';
import { usePurchaseMarketplace } from '../../hooks/marketplace/usePurchaseMarketplace';

// Add style to hide scrollbar
const scrollbarHideStyle = `
    .marketplace-modal::-webkit-scrollbar {
        display: none;
    }
    .marketplace-modal {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;

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
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    
    const { isPurchasing, error, setError, handlePurchase } = usePurchaseMarketplace(onPurchaseSuccess);

    // Lock scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Show error dialog when error occurs
    useEffect(() => {
        if (error) {
            setShowErrorDialog(true);
        }
    }, [error]);

    const handlePurchaseClick = () => {
        setShowConfirmation(true);
    };

    if (!isOpen || !item) {
        return null;
    }

    const mainImage = item.images?.[selectedImageIndex] || 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop';

    return (
        <>
            <style>{scrollbarHideStyle}</style>
            <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="marketplace-modal fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] max-w-[95vw] max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
            style={{
                content: {
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }
            }}
        >
            {/* Fixed Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 flex justify-between items-start">
                <h2 className="text-lg font-bold text-gray-900">Item Details</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0"
                >
                    ✕
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Images */}
                        <div className="flex flex-col gap-4">
                            {/* Main Image */}
                            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                                <img
                                    src={mainImage}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Image Thumbnails */}
                            {item.images && item.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto">
                                    {item.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                                                selectedImageIndex === index
                                                    ? 'border-blue-500'
                                                    : 'border-gray-200 hover:border-gray-300'
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

                        {/* Right: Details */}
                        <div className="flex flex-col gap-6">
                            {/* Title */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {item.title}
                                </h1>
                            </div>

                            {/* Seller Info */}
                            <div className="border-b border-gray-200 pb-4">
                                <p className="text-sm text-gray-600 mb-3">Seller</p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={item.creator_info?.avatar_url || `https://ui-avatars.com/api/?name=${item.creator_info?.full_name || 'Unknown'}&background=random`}
                                        alt={item.creator_info?.full_name || 'Seller'}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                    />
                                    <div>
                                        <p className="text-lg font-medium text-gray-900">
                                            {item.creator_info?.full_name || 'Unknown Seller'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {item.creator_info?.email || 'No email'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                                <p className="text-xs text-gray-600 mb-2">Price</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-blue-600">
                                        {item.price === 0 ? 'Free' : `${item.price} OP`}
                                    </span>
                                    {item.price === 0 && (
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                            Free Item
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xl font-bold text-gray-900">
                                        {item.purchase_count || 0}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">Purchased</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xl font-bold text-yellow-500">★ 4.5</p>
                                    <p className="text-xs text-gray-600 mt-1">Rating</p>
                                </div>
                            </div>

                            {/* Description */}
                            {item.description && (
                                <div>
                                    <p className="text-sm font-medium text-gray-900 mb-2">
                                        Description
                                    </p>
                                    <p className="text-gray-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-3 border-t border-gray-200">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                                >
                                    Preview
                                </button>
                                <button
                                    onClick={handlePurchaseClick}
                                    disabled={isPurchasing}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
                                >
                                    {isPurchasing ? 'Purchasing...' : item.price === 0 ? 'Get Free' : 'Purchase Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmDialog
                isOpen={showConfirmation}
                title="Confirm Purchase"
                message={`Are you sure you want to ${item.price === 0 ? 'get this free item' : `purchase "${item.title}" for ${item.price} OP`}?`}
                confirmButtonText={item.price === 0 ? 'Get Free' : 'Purchase'}
                cancelButtonText="Cancel"
                isLoading={isPurchasing}
                onConfirm={async () => {
                    setShowConfirmation(false);
                    await handlePurchase(item!._id);
                    // Error will be caught by useEffect and show error dialog automatically
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
        </Modal>
        </>
    );
};

export default MarketplaceItemDetailModal;
