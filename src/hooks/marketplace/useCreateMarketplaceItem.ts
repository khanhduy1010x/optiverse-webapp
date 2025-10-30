import { useState } from 'react';
import marketplaceService from '../../services/marketplace.service';
import { validateMarketplaceItem } from '../../utils/marketplace.transform';

export enum MarketplaceItemType {
    FLASHCARD = 'FLASHCARD',
}

interface FormData {
    title: string;
    description: string;
    price: number;
    type: MarketplaceItemType;
    type_id: string;
    images: File[];
}

interface UseCreateMarketplaceItemResult {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    previewUrls: string[];
    setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
    submitting: boolean;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveImage: (index: number) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    resetForm: () => void;
}

export const useCreateMarketplaceItem = (
    onSuccess?: () => void,
    onClose?: () => void
): UseCreateMarketplaceItemResult => {
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        price: 0,
        type: MarketplaceItemType.FLASHCARD,
        type_id: '',
        images: [],
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length + formData.images.length > 5) {
            setError('Maximum 5 images are allowed');
            return;
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files],
        }));

        // Create preview URLs
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrls(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: 0,
            type: MarketplaceItemType.FLASHCARD,
            type_id: '',
            images: [],
        });
        setPreviewUrls([]);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Use validation utils
        const validation = validateMarketplaceItem({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            typeId: formData.type_id,
            price: formData.price,
            imagesCount: formData.images.length,
        });

        if (!validation.valid) {
            setError(validation.error || 'Validation error');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Create FormData for file upload
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('description', formData.description);
            payload.append('price', formData.price.toString());
            payload.append('type', formData.type);
            payload.append('type_id', formData.type_id);

            formData.images.forEach(file => {
                payload.append('images', file);
            });

            await marketplaceService.create(payload as any);

            // Success - reset form and call callbacks
            resetForm();
            onSuccess?.();
            onClose?.();
        } catch (err: any) {
            // Extract backend error message
            let errorMessage = 'Error creating marketplace item';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            console.error('Error creating marketplace item:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return {
        formData,
        setFormData,
        previewUrls,
        setPreviewUrls,
        submitting,
        error,
        setError,
        handleInputChange,
        handleImageChange,
        handleRemoveImage,
        handleSubmit,
        resetForm,
    };
};
