import React from 'react';

import { ImagePreviewProps } from '../../types/chat/props/component.props';

const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemove }) => {
    // Handle case when images is undefined or empty
    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2 p-2 max-h-40 overflow-y-auto w-full" style={{ maxWidth: '100%' }}>
            {images.map((image, index) => (
                <div key={index} className="relative group">
                    <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className="h-20 w-20 object-cover rounded-md border border-gray-200"
                    />
                    <button
                        type="button"
                        className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => onRemove(index)}
                        aria-label="Xóa ảnh"
                    >
                        ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-xs text-white px-1 py-0.5 flex justify-between items-center">
                        <span className="truncate max-w-[70%]" title={image.name}>
                            {image.name.length > 10 ? image.name.substring(0, 10) + '...' : image.name}
                        </span>
                        <span>{(image.size / 1024).toFixed(0)} KB</span>
                    </div>
                </div>
            ))}
            {images.length > 0 && (
                <div className="flex items-center text-sm text-gray-500 ml-2">
                    {images.length} ảnh đã chọn
                </div>
            )}
        </div>
    );
};

export default ImagePreview;