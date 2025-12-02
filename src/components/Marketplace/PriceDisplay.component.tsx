import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface PricingInfo {
    original_price: number;
    discount_percentage: number;
    discount_amount: number;
    final_price: number;
    membership_tier?: string;
}

interface PriceDisplayProps {
    originalPrice: number;
    pricing?: PricingInfo;
    showBreakdown?: boolean;
    compact?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
    originalPrice,
    pricing,
    showBreakdown = false,
    compact = false,
}) => {
    const { t } = useAppTranslate('marketplace');
    const formatPrice = (price: number): string => {
        const formatted = new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
        return `${formatted} OP`;
    };

    // If no pricing info (user not logged in or no membership), show basic price
    if (!pricing) {
        return (
            <div className={compact ? 'text-lg font-bold text-gray-900' : 'text-2xl font-bold text-gray-900'}>
                {formatPrice(originalPrice)}
            </div>
        );
    }

    // Show pricing with discount
    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {pricing.discount_percentage > 0 && (
                    <>
                        <span className="text-lg line-through text-gray-500">
                            {formatPrice(pricing.original_price)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                            -{pricing.discount_percentage}%
                        </span>
                    </>
                )}
                <span className="text-lg font-bold text-green-600">
                    {formatPrice(pricing.final_price)}
                </span>
            </div>
        );
    }

    // Show full breakdown
    if (showBreakdown) {
        return (
            <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="text-gray-700">{t('original_price')}:</span>
                    <span className="font-semibold line-through text-gray-500">
                        {formatPrice(pricing.original_price)}
                    </span>
                </div>

                {pricing.membership_tier && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700">{t('membership')}:</span>
                        <span className="inline-flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                            {pricing.membership_tier}
                        </span>
                    </div>
                )}

                {pricing.discount_percentage > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700">{t('discount')}:</span>
                        <span className="font-semibold text-red-600">
                            -{pricing.discount_percentage}% ({formatPrice(pricing.discount_amount)})
                        </span>
                    </div>
                )}

                <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">{t('you_will_pay')}:</span>
                    <span className="text-2xl font-bold text-green-600">
                        {formatPrice(pricing.final_price)}
                    </span>
                </div>
            </div>
        );
    }

    // Default: Show stacked pricing
    return (
        <div className="space-y-2">
            {pricing.discount_percentage > 0 && (
                <div className="flex items-center gap-2">
                    <span className="line-through text-gray-500 text-lg">
                        {formatPrice(pricing.original_price)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                        -{pricing.discount_percentage}%
                    </span>
                </div>
            )}
            <div className="text-2xl font-bold text-green-600">
                {formatPrice(pricing.final_price)}
            </div>
            {pricing.membership_tier && (
                <div className="text-xs text-gray-600">
                    {pricing.membership_tier} {t('member')}
                </div>
            )}
        </div>
    );
};

export default PriceDisplay;
