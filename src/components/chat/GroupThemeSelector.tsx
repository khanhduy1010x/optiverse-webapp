import React, { useState, useRef } from 'react';
import { useGroupConversationTheme } from '../../hooks/chat/useGroupConversationTheme';
import { toast } from 'react-toastify';
import { ThemeSelectorProps } from '../../types/chat/props/component.props';

const GroupThemeSelector: React.FC<ThemeSelectorProps> = ({ conversationId, onClose, isOpen }) => {
    const {
        theme,
        loading,
        isUploading,
        updateTheme,
        uploadThemeImage,
        previewThemeImage,
        cancelPreview,
        resetTheme,
        hasPreview
    } = useGroupConversationTheme(conversationId);

    const [selectedColor, setSelectedColor] = useState<string>(theme?.backgroundColor || '#ffffff');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Danh sách màu nền có sẵn
    const backgroundColors = [
        '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
        '#ced4da', '#adb5bd', '#6c757d', '#495057',
        '#d8f3dc', '#b7e4c7', '#95d5b2', '#74c69d',
        '#d8e2dc', '#ffe5d9', '#ffcfd2', '#f8edeb',
        '#f0efeb', '#d8e2dc', '#ece4db', '#ffe5d9',
        '#ffd7ba', '#fec89a', '#e8e8e4', '#d8d8d8'
    ];

    // Xử lý khi chọn màu nền
    const handleColorSelect = async (color: string) => {
        setSelectedColor(color);
        try {
            await updateTheme({ backgroundColor: color });
            toast.success('Background color updated');
        } catch (error) {
            toast.error('Failed to update background color');
        }
    };

    // Xử lý khi chọn file hình ảnh
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Kiểm tra kích thước file (tối đa 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must not exceed 5MB');
            return;
        }

        // Tạo URL xem trước và lưu file đã chọn
        previewThemeImage(file);
        setSelectedFile(file);

        // Xóa giá trị của input file để có thể chọn lại file cũ nếu cần
        if (e.target) {
            e.target.value = '';
        }
    };

    // Xử lý khi xác nhận hình ảnh
    const handleConfirmImage = async () => {
        if (!selectedFile) return;

        try {
            // Tải lên hình ảnh và cập nhật theme
            await uploadThemeImage(selectedFile);
            toast.success('Image uploaded successfully');

            // Xóa file đã chọn
            setSelectedFile(null);
        } catch (error) {
            toast.error('Failed to upload image');
        }
    };

    // Xử lý khi hủy xem trước
    const handleCancelPreview = () => {
        cancelPreview();
        setSelectedFile(null);
    };

    // Xử lý khi xóa theme
    const handleResetTheme = async () => {
        try {
            await resetTheme();
            setSelectedColor('#ffffff');
            setSelectedFile(null);
            toast.success('Theme reset to default');
        } catch (error) {
            toast.error('Failed to reset theme');
        }
    };

    // Nếu không mở, không render gì cả
    if (!isOpen) return null;

    return (
        <div className="h-full bg-white border-l border-gray-200 shadow-lg w-80 flex flex-col min-h-0 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-medium">Customize theme</h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {/* Xem trước theme */}
                <div
                    className="h-32 rounded-lg mb-4 flex items-center justify-center relative"
                    style={{
                        backgroundColor: theme?.backgroundUrl ? 'transparent' : (theme?.backgroundColor || '#ffffff'),
                        backgroundImage: theme?.backgroundUrl ? `url(${theme.backgroundUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <span>Xem trước theme</span>
                </div>

                {/* Tải lên hình ảnh */}
                <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Background image</p>
                    <div className="flex items-center flex-wrap gap-2">
                        {!hasPreview ? (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                                disabled={isUploading || loading}
                            >
                                {isUploading ? 'Uploading...' : 'Choose image'}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleConfirmImage}
                                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Confirm'}
                                </button>
                                <button
                                    onClick={handleCancelPreview}
                                    className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm"
                                    disabled={isUploading}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Chọn màu nền */}
                <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Background color</p>
                    <div className="grid grid-cols-6 gap-2">
                        {backgroundColors.map((color) => (
                            <div
                                key={color}
                                className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                                    selectedColor === color ? 'border-blue-500' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorSelect(color)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
                {/* Nút reset theme */}
                <button
                    onClick={handleResetTheme}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    disabled={loading || isUploading}
                >
                    Reset to default
                </button>
            </div>
        </div>
    );
};

export default GroupThemeSelector;