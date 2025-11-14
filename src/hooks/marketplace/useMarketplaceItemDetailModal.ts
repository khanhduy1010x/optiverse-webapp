import { useState, useEffect } from 'react';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { usePurchaseMarketplace } from './usePurchaseMarketplace';
import { usePreviewFlashcards } from './usePreviewFlashcards';
import { useRatingStats } from './useRatingStats';

interface PricingInfo {
    original_price?: number;
    discount_percentage?: number;
    discount_amount?: number;
    final_price?: number;
    membership_tier?: string;
}

interface UseMarketplaceItemDetailModalProps {
    item: MarketplaceItem | null;
    isOpen: boolean;
    onPurchaseSuccess?: () => void;
}

interface UseMarketplaceItemDetailModalReturn {
    selectedImageIndex: number;
    setSelectedImageIndex: (index: number) => void;
    showConfirmation: boolean;
    setShowConfirmation: (show: boolean) => void;
    showErrorDialog: boolean;
    setShowErrorDialog: (show: boolean) => void;
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    ratingRefreshKey: number;
    refreshRatingKey: () => void;
    mainImage: string;
    isPurchasing: boolean;
    error: string | null;
    errorCode?: number;
    setError: (error: string | null) => void;
    handlePurchase: (itemId: string) => Promise<void>;
    flashcards: any[];
    totalFlashcards: number;
    previewCount: number;
    previewLoading: boolean;
    fetchPreviewFlashcards: (itemId: string) => Promise<void>;
    ratingStats: any;
    refreshRatingStats: () => void;
    handlePreviewClick: () => Promise<void>;
    handlePurchaseClick: () => void;
    pricingInfo: PricingInfo | null;
}

export const useMarketplaceItemDetailModal = ({
    item,
    isOpen,
    onPurchaseSuccess,
}: UseMarketplaceItemDetailModalProps): UseMarketplaceItemDetailModalReturn => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [ratingRefreshKey, setRatingRefreshKey] = useState(0);

    // Custom hooks
    const { isPurchasing, error, errorCode, setError, handlePurchase } = usePurchaseMarketplace(onPurchaseSuccess);
    const { flashcards, totalFlashcards, previewCount, loading: previewLoading, fetchPreviewFlashcards } = usePreviewFlashcards();
    const { stats: ratingStats, refreshStats: refreshRatingStats } = useRatingStats(item?._id || '');

    // Reset image index when item changes
    useEffect(() => {
        setSelectedImageIndex(0);
    }, [item?._id]);

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

    // Get main image - ensure it's based on current item and selectedImageIndex
    const mainImage = item?.images && item.images.length > selectedImageIndex
        ? item.images[selectedImageIndex]
        : item?.images?.[0] || '';

    // Get pricing info from item
    const pricingInfo: PricingInfo | null = item?.pricing ? {
        original_price: item.pricing.original_price,
        discount_percentage: item.pricing.discount_percentage,
        discount_amount: item.pricing.discount_amount,
        final_price: item.pricing.final_price,
        membership_tier: item.pricing.membership_tier,
    } : null;

    // Handle preview click
    const handlePreviewClick = async () => {
        if (item?._id) {
            setShowPreview(true);
            await fetchPreviewFlashcards(item._id);
        }
    };

    // Handle purchase click
    const handlePurchaseClick = () => {
        setShowConfirmation(true);
    };

    return {
        selectedImageIndex,
        setSelectedImageIndex,
        showConfirmation,
        setShowConfirmation,
        showErrorDialog,
        setShowErrorDialog,
        showPreview,
        setShowPreview,
        ratingRefreshKey,
        refreshRatingKey: () => setRatingRefreshKey(prev => prev + 1),
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
        fetchPreviewFlashcards,
        ratingStats,
        refreshRatingStats,
        handlePreviewClick,
        handlePurchaseClick,
        pricingInfo,
    };
};

