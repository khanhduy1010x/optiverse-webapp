import React from 'react';
import Modal from 'react-modal';

interface DiscountDetails {
    original_price: number;
    discount_percentage: number;
    discount_amount: number;
    final_price: number;
    remainingPoints?: number;
    membership_tier?: string;
}

interface SuccessNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
    title?: string;
    discountDetails?: DiscountDetails;
}

const SuccessNotificationModal: React.FC<SuccessNotificationModalProps> = ({
    isOpen,
    onClose,
    message = 'Your purchase was successful!',
    title = 'Purchase Successful',
    discountDetails,
}) => {
    const formatPrice = (price: number): string => {
        const formatted = new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
        return `${formatted} OP`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[3000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[3000]"
        >
            <div className="p-8">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-center text-gray-600 mb-6">
                    {message}
                </p>

                {/* Discount Breakdown (if available) */}
                {discountDetails && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-3">
                        {/* Original Price */}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Giá gốc:</span>
                            <span className="font-semibold line-through text-gray-500">
                                {formatPrice(discountDetails.original_price)}
                            </span>
                        </div>

                        {/* Membership Tier */}
                        {discountDetails.membership_tier && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Membership:</span>
                                <span className="inline-flex items-center text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                                    {discountDetails.membership_tier}
                                </span>
                            </div>
                        )}

                        {/* Discount */}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Discount:</span>
                            <span className="font-semibold text-red-600">
                                -{discountDetails.discount_percentage}% ({formatPrice(discountDetails.discount_amount)})
                            </span>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-blue-200 pt-3" />

                        {/* Final Price */}
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Bạn đã trả:</span>
                            <span className="text-lg font-bold text-green-600">
                                {formatPrice(discountDetails.final_price)}
                            </span>
                        </div>

                        {/* Remaining Points */}
                        {discountDetails.remainingPoints !== undefined && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-700">Điểm còn lại:</span>
                                <span className="font-semibold text-gray-900">
                                    {formatPrice(discountDetails.remainingPoints)}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                    Got it!
                </button>
            </div>
        </Modal>
    );
};

export default SuccessNotificationModal;
