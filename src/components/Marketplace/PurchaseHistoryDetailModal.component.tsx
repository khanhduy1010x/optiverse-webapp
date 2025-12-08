import React, { useState } from 'react';
import Modal from 'react-modal';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import RichTextDisplay from '../common/RichTextDisplay.component';
import '../common/RichTextDisplay.style.css';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface PurchaseHistoryDetailModalProps {
    item: MarketplaceItem | null;
    purchaseDate?: string;
    purchasePrice?: number;
    isOpen: boolean;
    onClose: () => void;
}

const PurchaseHistoryDetailModal: React.FC<PurchaseHistoryDetailModalProps> = ({
    item,
    purchaseDate,
    purchasePrice,
    isOpen,
    onClose,
}) => {
    const { t } = useAppTranslate('marketplace');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!isOpen || !item) {
        return null;
    }

    const mainImage = item.images && item.images.length > 0 
        ? item.images[selectedImageIndex] 
        : 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop';

    const formattedDate = purchaseDate 
        ? new Date(purchaseDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'N/A';

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
            overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000]"
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

            <div className="p-8">
                {/* Header */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Purchase Details</h2>
                    <p className="text-gray-600">Item you purchased from marketplace</p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Image */}
                    <div>
                        <div className="rounded-xl overflow-hidden bg-gray-100 mb-4 h-96">
                            <img
                                src={mainImage}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
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

                    {/* Right: Details */}
                    <div>
                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h1>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                            {item.description && (
                                <RichTextDisplay 
                                    content={item.description}
                                    className="text-gray-600 text-sm leading-relaxed"
                                />
                            ) || (
                                <p className="text-gray-600 text-sm leading-relaxed">{t('no_description_available')}</p>
                            )}
                        </div>

                        {/* Purchase Info */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 mb-1">Purchase Price</p>
                                    <p className="text-2xl font-bold text-blue-600">{purchasePrice === 0 ? 'Free' : `${purchasePrice || 0} OP`}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 mb-1">Purchase Date</p>
                                    <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
                                </div>
                            </div>
                        </div>

                        {/* Creator Info */}
                        {item.creator_info && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Creator</h3>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={
                                            item.creator_info.avatar_url ||
                                            `https://ui-avatars.com/api/?name=${item.creator_info.full_name}&background=0ea5e9&color=fff&size=48`
                                        }
                                        alt={item.creator_info.full_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">{item.creator_info.full_name}</p>
                                        <p className="text-xs text-gray-600">{item.creator_info.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PurchaseHistoryDetailModal;
