import React from 'react';
import Modal from 'react-modal';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface PricingInfo {
  original_price?: number;
  discount_percentage?: number;
  discount_amount?: number;
  final_price?: number;
  membership_tier?: string;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
  pricing?: PricingInfo;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
  isDangerous = false,
  pricing,
}) => {
  const { t } = useAppTranslate('marketplace');
  const formatPrice = (price: number): string => {
    const formatted = new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    return `${formatted} OP`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
    >
      <div className="p-8">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h2>

        {/* Content */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Pricing Breakdown (if available) */}
        {pricing && pricing.final_price !== undefined && pricing.final_price > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-2">
            {/* Original Price */}
            {pricing.original_price && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{t('original_price')}:</span>
                <span className="font-semibold line-through text-gray-500">
                  {formatPrice(pricing.original_price)}
                </span>
              </div>
            )}

            {/* Discount */}
            {pricing.discount_percentage > 0 && pricing.discount_amount && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{t('discount')}:</span>
                <span className="font-semibold text-red-600">
                  -{pricing.discount_percentage}% ({formatPrice(pricing.discount_amount)})
                </span>
              </div>
            )}

            {/* Membership Tier */}
            {pricing.membership_tier && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{t('membership')}:</span>
                <span className="inline-flex items-center text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                  {pricing.membership_tier}
                </span>
              </div>
            )}

            {/* Separator */}
            <div className="border-t border-blue-200 pt-2" />

            {/* Final Price */}
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">{t('you_pay')}:</span>
              <span className="text-lg font-bold text-green-600">
                {formatPrice(pricing.final_price)}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isDangerous
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? t('processing') : confirmButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
