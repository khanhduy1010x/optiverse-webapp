import { useState } from 'react';
import marketplaceService from '../../services/marketplace.service';

export interface DiscountDetails {
    original_price: number;
    discount_percentage: number;
    discount_amount: number;
    final_price: number;
    remainingPoints?: number;
    membership_tier?: string;
}

interface UsePurchaseMarketplaceResult {
    isPurchasing: boolean;
    error: string | null;
    errorCode?: number;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    lastPurchaseDiscount: DiscountDetails | null;
    handlePurchase: (itemId: string) => Promise<void>;
}

export const usePurchaseMarketplace = (
    onSuccess?: () => void
): UsePurchaseMarketplaceResult => {
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<number | undefined>(undefined);
    const [lastPurchaseDiscount, setLastPurchaseDiscount] = useState<DiscountDetails | null>(null);

    const handlePurchase = async (itemId: string) => {
        setIsPurchasing(true);
        setError(null);
        setErrorCode(undefined);
        try {
            const response = await marketplaceService.purchase({
                marketplace_item_id: itemId,
            });
            console.log('Purchase successful:', response);
            
            // Extract discount details from response
            if (response?.discount_details) {
                setLastPurchaseDiscount(response.discount_details);
            }
            
            onSuccess?.();
        } catch (err: any) {
            console.error('Error purchasing item:', err);
            const errorMessage = 
                err.response?.data?.message || 'Purchase failed. Please try again.';
            const code = err.response?.data?.code;
            setError(errorMessage);
            setErrorCode(code);
            console.log('Error code:', code, 'Message:', errorMessage);
        } finally {
            setIsPurchasing(false);
        }
    };

    return {
        isPurchasing,
        error,
        errorCode,
        setError,
        lastPurchaseDiscount,
        handlePurchase,
    };
};
