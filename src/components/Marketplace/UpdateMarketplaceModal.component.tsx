import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import marketplaceService from '../../services/marketplace.service';
import { useFlashcardDecks } from '../../hooks/useFlashcardDecks';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';

enum MarketplaceItemType {
    FLASHCARD = 'FLASHCARD',
}

interface UpdateMarketplaceModalProps {
    isOpen: boolean;
    item: MarketplaceItem | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const UpdateMarketplaceModal: React.FC<UpdateMarketplaceModalProps> = ({
    isOpen,
    item,
    onClose,
    onSuccess,
}) => {
    const { decks, loading: deckLoading } = useFlashcardDecks();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        type: MarketplaceItemType.FLASHCARD,
        type_id: '',
        images: [] as File[],
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // Initialize form with item data when modal opens
    useEffect(() => {
        if (isOpen && item) {
            setFormData({
                title: item.title,
                description: item.description || '',
                price: item.price || 0,
                type: MarketplaceItemType.FLASHCARD,
                type_id: item.type_id || '',
                images: [],
            });
            setExistingImages(item.images || []);
            setPreviewUrls([]);
            setError(null);
        }
    }, [isOpen, item]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        const totalImages = existingImages.length + formData.images.length + files.length;
        if (totalImages > 5) {
            setError(`Maximum 5 images are allowed (you have ${existingImages.length} existing images)`);
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

    const handleRemoveNewImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError('Please enter marketplace item name');
            return;
        }

        if (!formData.type) {
            setError('Please select item type');
            return;
        }

        if (!formData.type_id) {
            setError('Please select a flashcard deck');
            return;
        }

        if (formData.price < 0) {
            setError('Price cannot be negative');
            return;
        }

        if (!item) {
            setError('No item selected');
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
            
            // Send retained image URLs as JSON string
            if (existingImages.length > 0) {
                payload.append('retained_images', JSON.stringify(existingImages));
            }

            // Add new images only
            formData.images.forEach((file) => {
                payload.append('images', file);
            });

            await marketplaceService.update(item._id, payload as any);

            // Success - close modal and call callback
            setFormData({
                title: '',
                description: '',
                price: 0,
                type: MarketplaceItemType.FLASHCARD,
                type_id: '',
                images: [],
            });
            setPreviewUrls([]);
            setExistingImages([]);
            onSuccess?.();
            onClose();
        } catch (err: any) {
            // Extract backend error message
            let errorMessage = 'Error updating marketplace item';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            console.error('Error updating marketplace item:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
        >
            <style>{`
                .update-marketplace-modal::-webkit-scrollbar {
                    display: none;
                }
                .update-marketplace-modal {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    border-color: #d1d5db;
                }
                .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    border-color: #d1d5db;
                    font-size: 0.875rem;
                }
                .ql-editor {
                    min-height: 200px;
                }
                .ql-toolbar.ql-snow {
                    padding: 8px;
                }
                .ql-toolbar.ql-snow .ql-formats {
                    margin-right: 8px;
                }
            `}</style>
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Edit Item</h2>
                        <p className="text-gray-600 mt-1">Update your marketplace item</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter item name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <ReactQuill
                            value={formData.description}
                            onChange={(content) => {
                                setFormData(prev => ({
                                    ...prev,
                                    description: content
                                }));
                            }}
                            modules={{
                                toolbar: [
                                    ['bold', 'italic', 'underline', 'strike'],
                                    ['blockquote', 'code-block'],
                                    [{ 'header': 1 }, { 'header': 2 }],
                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                    ['link', 'image'],
                                    ['clean']
                                ]
                            }}
                            formats={[
                                'bold', 'italic', 'underline', 'strike',
                                'blockquote', 'code-block', 'header',
                                'list', 'link', 'image'
                            ]}
                            theme="snow"
                            placeholder=""
                            className="bg-white"
                            style={{ height: '200px', marginBottom: '40px' }}
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (OP) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-2.5 text-gray-500 text-sm">OP</span>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                min="0"
                                step="1"
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="">-- Select item type --</option>
                            <option value={MarketplaceItemType.FLASHCARD}>Flashcard</option>
                        </select>
                    </div>

                    {/* Flashcard Deck Selection */}
                    {formData.type === MarketplaceItemType.FLASHCARD && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Flashcard Deck <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="type_id"
                                value={formData.type_id}
                                onChange={handleInputChange}
                                disabled={deckLoading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
                            >
                                <option value="">-- Select a deck --</option>
                                {decks.map(deck => (
                                    <option key={deck._id} value={deck._id}>
                                        {deck.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Images
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {existingImages.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Existing ${index}`}
                                            className="w-full h-20 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add More Images (Max {5 - existingImages.length} left)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-input-update"
                            />
                            <label
                                htmlFor="image-input-update"
                                className="cursor-pointer block"
                            >
                                <p className="text-sm text-gray-600">
                                    <span className="text-blue-500 font-medium">Select images</span> or drag
                                </p>
                            </label>
                        </div>

                        {/* New Image Previews */}
                        {previewUrls.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`New ${index}`}
                                            className="w-full h-20 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || deckLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 text-sm"
                        >
                            {submitting ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default UpdateMarketplaceModal;