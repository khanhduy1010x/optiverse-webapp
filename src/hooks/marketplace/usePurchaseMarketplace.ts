import { useState } from 'react';
import marketplaceService from '../../services/marketplace.service';

interface UsePurchaseMarketplaceResult {
    isPurchasing: boolean;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    handlePurchase: (itemId: string) => Promise<void>;
}

export const usePurchaseMarketplace = (
    onSuccess?: () => void
): UsePurchaseMarketplaceResult => {
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePurchase = async (itemId: string) => {
        setIsPurchasing(true);
        setError(null);
        try {
            const response = await marketplaceService.purchase({
                marketplace_item_id: itemId,
            });
            console.log('Purchase successful:', response);
            onSuccess?.();
        } catch (err: any) {
            console.error('Error purchasing item:', err);
            const errorMessage = 
                err.response?.data?.message || 'Purchase failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsPurchasing(false);
        }
    };

    return {
        isPurchasing,
        error,
        setError,
        handlePurchase,
    };
};
