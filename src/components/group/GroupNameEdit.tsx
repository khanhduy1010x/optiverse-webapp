import React, { useState, useEffect } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { GroupNameEditProps } from '../../types/group/GroupSettingsType';

const GroupNameEdit: React.FC<GroupNameEditProps> = ({
  currentName,
  onUpdate,
  isUpdating = false,
  disabled = false,
  maxLength = 100
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditValue(currentName);
  }, [currentName]);

  const handleStartEdit = () => {
    if (disabled || isUpdating) return;
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue(currentName);
    setError(null);
  };

  const handleSaveEdit = async () => {
    const trimmedValue = editValue.trim();
    
    // Validation
    if (!trimmedValue) {
      setError('Tên nhóm không được để trống');
      return;
    }

    if (trimmedValue.length > maxLength) {
      setError(`Tên nhóm không được vượt quá ${maxLength} ký tự`);
      return;
    }

    if (trimmedValue === currentName) {
      setIsEditing(false);
      return;
    }

    try {
      await onUpdate(trimmedValue);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError('Có lỗi xảy ra khi cập nhật tên nhóm');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    if (error) setError(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isUpdating}
            maxLength={maxLength}
            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${isUpdating ? 'bg-gray-100' : 'bg-white'}`}
            placeholder="Nhập tên nhóm..."
            autoFocus
          />
          
          <button
            onClick={handleSaveEdit}
            disabled={isUpdating || !editValue.trim()}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
            title="Lưu"
          >
            {isUpdating ? (
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Check size={16} />
            )}
          </button>
          
          <button
            onClick={handleCancelEdit}
            disabled={isUpdating}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
            title="Hủy"
          >
            <X size={16} />
          </button>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <p className="text-gray-500 text-xs">
          {editValue.length}/{maxLength} ký tự
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h3 className="text-xl font-semibold text-gray-900 flex-1">
        {currentName}
      </h3>
      
      <button
        onClick={handleStartEdit}
        disabled={disabled || isUpdating}
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 disabled:hover:text-gray-400 disabled:hover:bg-transparent transition-all"
        title="Chỉnh sửa tên nhóm"
      >
        <Edit3 size={16} />
      </button>
    </div>
  );
};

export default GroupNameEdit;