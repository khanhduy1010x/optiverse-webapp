import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { useFlashcardDecks } from '../../hooks/useFlashcardDecks';
import { useCreateMarketplaceItem, MarketplaceItemType } from '../../hooks/marketplace/useCreateMarketplaceItem';

interface CreateMarketplaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreateMarketplaceModal: React.FC<CreateMarketplaceModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { decks, loading: deckLoading } = useFlashcardDecks();
    const {
        formData,
        previewUrls,
        submitting,
        error,
        setError,
        handleInputChange,
        handleImageChange,
        handleRemoveImage,
        handleSubmit,
    } = useCreateMarketplaceItem(onSuccess, onClose);

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

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="create-marketplace-modal fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
        >
            <style>{`
                .create-marketplace-modal::-webkit-scrollbar {
                    display: none;
                }
                .create-marketplace-modal {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create New Item</h2>
                        <p className="text-gray-600 mt-1">Share your flashcard decks with the community</p>
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
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe your item..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
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
                        <p className="mt-1 text-xs text-gray-500">Enter 0 for free</p>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Images (Max 5)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-input"
                            />
                            <label
                                htmlFor="image-input"
                                className="cursor-pointer block"
                            >
                                <p className="text-sm text-gray-600">
                                    <span className="text-blue-500 font-medium">Select images</span> or drag
                                </p>
                            </label>
                        </div>

                        {/* Image Previews */}
                        {previewUrls.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Preview ${index}`}
                                            className="w-full h-20 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
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
                            {submitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CreateMarketplaceModal;
