import React, { useState, useRef } from 'react';
import { useConversationTheme } from '../../hooks/chat/useConversationTheme';
import { toast } from 'react-toastify';

interface ThemeSelectorProps {
    conversationId: string;
    onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ conversationId, onClose }) => {
    const { theme, loading, updateTheme, uploadThemeImage, resetTheme, hasPreview } = useConversationTheme(conversationId);
    const [selectedColor, setSelectedColor] = useState<string>(theme?.backgroundColor || '#ffffff');
    const [selectedTextColor, setSelectedTextColor] = useState<string>(theme?.textColor || '#000000');
    const [isUploading, setIsUploading] = useState<boolean>(false);
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

    // Danh sách màu chữ có sẵn
    const textColors = [
        '#000000', '#212529', '#343a40', '#495057',
        '#6c757d', '#495057', '#343a40', '#212529'
    ];

    // Xử lý khi chọn màu nền
    const handleColorSelect = async (color: string) => {
        setSelectedColor(color);
        try {
            await updateTheme({ backgroundColor: color, textColor: selectedTextColor });
            toast.success('Đã cập nhật màu nền');
        } catch (error) {
            toast.error('Không thể cập nhật màu nền');
        }
    };

    // Xử lý khi chọn màu chữ
    const handleTextColorSelect = async (color: string) => {
        setSelectedTextColor(color);
        try {
            await updateTheme({ backgroundColor: selectedColor, textColor: color });
            toast.success('Đã cập nhật màu chữ');
        } catch (error) {
            toast.error('Không thể cập nhật màu chữ');
        }
    };

    // Xử lý khi tải lên hình ảnh
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file hình ảnh');
            return;
        }

        // Kiểm tra kích thước file (tối đa 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước file không được vượt quá 5MB');
            return;
        }

        setIsUploading(true);
        try {
            // Tải lên hình ảnh và cập nhật theme
            await uploadThemeImage(file);
            toast.success('Đã tải lên hình ảnh thành công');
        } catch (error) {
            toast.error('Không thể tải lên hình ảnh');
        } finally {
            setIsUploading(false);
            // Xóa giá trị của input file để có thể chọn lại file cũ nếu cần
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Xử lý khi xóa theme
    const handleResetTheme = async () => {
        try {
            await resetTheme();
            setSelectedColor('#ffffff');
            setSelectedTextColor('#000000');
            toast.success('Đã xóa theme');
        } catch (error) {
            toast.error('Không thể xóa theme');
        }
    };

    // Hiển thị trạng thái tải lên
    const uploadingStatus = isUploading ? 'Đang tải...' : hasPreview ? 'Đang xem trước...' : 'Tải lên hình ảnh';

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 w-80">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Tùy chỉnh theme</h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Xem trước theme */}
            <div
                className="h-32 rounded-lg mb-4 flex items-center justify-center relative"
                style={{
                    backgroundColor: theme?.backgroundUrl ? 'transparent' : selectedColor,
                    backgroundImage: theme?.backgroundUrl ? `url(${theme.backgroundUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: selectedTextColor
                }}
            >
                <span style={{ color: selectedTextColor }}>Xem trước theme</span>
                {hasPreview && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <span className="text-white">Đang xem trước...</span>
                    </div>
                )}
            </div>

            {/* Tải lên hình ảnh */}
            <div className="mb-4">
                <p className="text-sm font-medium mb-2">Hình nền</p>
                <div className="flex items-center">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm mr-2 disabled:opacity-50"
                        disabled={isUploading || loading}
                    >
                        {uploadingStatus}
                    </button>
                    {theme?.backgroundUrl && (
                        <button
                            onClick={async () => {
                                try {
                                    await updateTheme({ backgroundUrl: undefined });
                                    toast.success('Đã xóa hình nền');
                                } catch (error) {
                                    toast.error('Không thể xóa hình nền');
                                }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
                            disabled={isUploading || loading || hasPreview}
                        >
                            Xóa hình
                        </button>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </div>

            {/* Chọn màu nền */}
            <div className="mb-4">
                <p className="text-sm font-medium mb-2">Màu nền</p>
                <div className="grid grid-cols-6 gap-2">
                    {backgroundColors.map((color) => (
                        <div
                            key={color}
                            className={`w-8 h-8 rounded-full cursor-pointer border-2 ${selectedColor === color ? 'border-blue-500' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorSelect(color)}
                        />
                    ))}
                </div>
            </div>

            {/* Chọn màu chữ */}
            <div className="mb-4">
                <p className="text-sm font-medium mb-2">Màu chữ</p>
                <div className="grid grid-cols-6 gap-2">
                    {textColors.map((color) => (
                        <div
                            key={color}
                            className={`w-8 h-8 rounded-full cursor-pointer border-2 ${selectedTextColor === color ? 'border-blue-500' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleTextColorSelect(color)}
                        />
                    ))}
                </div>
            </div>

            {/* Nút reset theme */}
            <button
                onClick={handleResetTheme}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 mt-2"
                disabled={loading || isUploading}
            >
                Khôi phục mặc định
            </button>
        </div>
    );
};

export default ThemeSelector; 