import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useFlashcardDecks } from '../../hooks/useFlashcardDecks';
import { useCreateMarketplaceItem, MarketplaceItemType } from '../../hooks/marketplace/useCreateMarketplaceItem';
import { useAppTranslate } from '../../hooks/useAppTranslate';

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
    const { t } = useAppTranslate('marketplace');
    const { decks, loading: deckLoading } = useFlashcardDecks();
    const [isFree, setIsFree] = useState(false);
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

    // Handle free checkbox change
    const handleFreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setIsFree(isChecked);
        if (isChecked) {
            handleInputChange({
                target: { name: 'price', value: '0' }
            } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    // Format price input as VND (no suffix)
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isFree) return; // Don't allow changes if free is checked

        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value === '') {
            handleInputChange({
                target: { name: 'price', value: '' }
            } as React.ChangeEvent<HTMLInputElement>);
        } else {
            const numberValue = parseInt(value);
            // Format with thousand separators
            const formattedValue = numberValue.toLocaleString('vi-VN');
            handleInputChange({
                target: { name: 'price', value: numberValue.toString() }
            } as React.ChangeEvent<HTMLInputElement>);
        }
    };

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
                        <h2 className="text-2xl font-bold text-gray-900">{t('create_new_item')}</h2>
                        <p className="text-gray-600 mt-1">{t('share_flashcard_decks')}</p>
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
                            {t('item_name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder={t('enter_item_name')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('description')}
                        </label>
                        <ReactQuill
                            value={formData.description}
                            onChange={(content) => {
                                handleInputChange({
                                    target: { name: 'description', value: content }
                                } as React.ChangeEvent<HTMLInputElement>);
                            }}
                            modules={{
                                toolbar: [
                                    ['bold', 'italic', 'underline', 'strike'],
                                    ['blockquote', 'code-block'],
                                    [{ 'header': 1 }, { 'header': 2 }],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
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
                            placeholder={t('describe_item')}
                            className="bg-white"
                            style={{ height: '200px', marginBottom: '40px' }}
                        />
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('item_type')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="">-- {t('select_item_type')} --</option>
                            <option value={MarketplaceItemType.FLASHCARD}>{t('flashcard')}</option>
                        </select>
                    </div>

                    {/* Flashcard Deck Selection */}
                    {formData.type === MarketplaceItemType.FLASHCARD && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('flashcard_deck')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="type_id"
                                value={formData.type_id}
                                onChange={handleInputChange}
                                disabled={deckLoading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
                            >
                                <option value="">-- {t('select_deck')} --</option>
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
                            {t('price')} (OP) <span className="text-red-500">*</span>
                        </label>

                        {/* Free Checkbox */}
                        <div className="mb-3 flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="free-checkbox"
                                checked={isFree}
                                onChange={handleFreeChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="free-checkbox" className="text-sm text-gray-700 cursor-pointer">
                                Make this item free
                            </label>
                        </div>

                        {/* Price Input */}
                        <div className="relative">
                            <span className="absolute left-4 top-2.5 text-gray-500 text-sm font-medium">OP</span>
                            <input
                                type="text"
                                name="price"
                                value={formData.price && !isFree ? parseInt(formData.price.toString()).toLocaleString('vi-VN') : (formData.price || '')}
                                onChange={handlePriceChange}
                                disabled={isFree}
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{t('enter_0_for_free')}</p>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('images')} (Max 5)
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
                                    <span className="text-blue-500 font-medium">{t('select_images')}</span> {t('or_drag')}
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
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || deckLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 text-sm"
                        >
                            {submitting ? t('creating') : t('create')}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CreateMarketplaceModal;
