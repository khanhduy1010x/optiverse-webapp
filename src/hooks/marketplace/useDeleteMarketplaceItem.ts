import { useState } from 'react';
import marketplaceService from '../../services/marketplace.service';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';

interface UseDeleteMarketplaceItemResult {
    isDeleting: boolean;
    deleteError: string | null;
    showDeleteConfirm: boolean;
    itemToDelete: MarketplaceItem | null;
    setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
    setItemToDelete: React.Dispatch<React.SetStateAction<MarketplaceItem | null>>;
    setDeleteError: React.Dispatch<React.SetStateAction<string | null>>;
    handleDeleteClick: (item: MarketplaceItem) => void;
    handleConfirmDelete: () => Promise<void>;
    handleCancelDelete: () => void;
}

export const useDeleteMarketplaceItem = (
    onSuccess?: () => Promise<void>
): UseDeleteMarketplaceItemResult => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<MarketplaceItem | null>(null);

    const handleDeleteClick = (item: MarketplaceItem) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            setIsDeleting(true);
            setDeleteError(null);
            await marketplaceService.delete(itemToDelete._id);
            setShowDeleteConfirm(false);
            setItemToDelete(null);
            // Refetch the items after successful deletion
            await onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
            setDeleteError(errorMessage);
            console.error('Error deleting item:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setItemToDelete(null);
    };

    return {
        isDeleting,
        deleteError,
        showDeleteConfirm,
        itemToDelete,
        setShowDeleteConfirm,
        setItemToDelete,
        setDeleteError,
        handleDeleteClick,
        handleConfirmDelete,
        handleCancelDelete,
    };
};
