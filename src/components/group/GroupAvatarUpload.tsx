import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Trash2 } from 'lucide-react';
import { GroupAvatarUploadProps } from '../../types/group/GroupSettingsType';

const GroupAvatarUpload: React.FC<GroupAvatarUploadProps> = ({
  currentAvatar,
  groupName,
  onUpload,
  onRemove,
  isUploading = false,
  disabled = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    onUpload(file);
    setShowMenu(false);
  };

  const handleRemoveAvatar = () => {
    onRemove();
    setPreviewUrl(null);
    setShowMenu(false);
  };

  const handleCameraClick = () => {
    if (disabled || isUploading) return;
    setShowMenu(!showMenu);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const currentImageUrl = previewUrl || currentAvatar;

  return (
    <div className="relative">
      {/* Avatar Display */}
      <div className="relative w-24 h-24 mx-auto">
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt={groupName}
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-white text-xl font-bold">
              {getInitials(groupName)}
            </span>
          </div>
        )}

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Camera Button */}
        <button
          onClick={handleCameraClick}
          disabled={disabled || isUploading}
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
        >
          <Camera size={16} />
        </button>
      </div>

      {/* Action Menu */}
      {showMenu && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[160px]">
          <button
            onClick={handleUploadClick}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
          >
            <Upload size={16} />
            Tải ảnh lên
          </button>
          
          {currentAvatar && (
            <button
              onClick={handleRemoveAvatar}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
            >
              <Trash2 size={16} />
              Xóa ảnh
            </button>
          )}
          
          <button
            onClick={() => setShowMenu(false)}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-500"
          >
            <X size={16} />
            Hủy
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Backdrop to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default GroupAvatarUpload;