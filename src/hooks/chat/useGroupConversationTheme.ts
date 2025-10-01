import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../firebase';
import chatService from '../../services/chat.service';

/**
 * Hook để quản lý theme cho group conversation
 * @param groupConversationId ID của group conversation
 */
export function useGroupConversationTheme(groupConversationId: string) {
  const [theme, setTheme] = useState<{
    backgroundUrl?: string;
    backgroundColor?: string;
    textColor?: string;
    updatedAt?: number;
    updatedBy?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Lắng nghe thay đổi theme từ Firebase
  useEffect(() => {
    if (!groupConversationId) {
      setLoading(false);
      return;
    }

    const themeRef = ref(db, `groupConversations/${groupConversationId}/theme`);

    const unsubscribe = onValue(
      themeRef,
      snapshot => {
        if (snapshot.exists()) {
          setTheme(snapshot.val());
        } else {
          setTheme(null);
        }
        setLoading(false);
      },
      err => {
        console.error('Error listening to group theme changes:', err);
        setError('Không thể lắng nghe thay đổi theme');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupConversationId]);

  // Hàm cập nhật theme
  const updateTheme = async (newTheme: {
    backgroundUrl?: string;
    backgroundColor?: string;
    textColor?: string;
  }) => {
    if (!groupConversationId) return false;

    try {
      setLoading(true);

      // Áp dụng theme tạm thời ở front-end trước
      setTheme(prev => ({
        ...(prev || {}),
        ...newTheme,
        updatedAt: Date.now(),
        updatedBy: localStorage.getItem('user_id') || '',
      }));

      // Gửi cập nhật lên back-end
      await chatService.updateGroupConversationTheme(groupConversationId, newTheme);

      // Nếu xóa backgroundUrl, cũng xóa preview
      if (newTheme.backgroundUrl === undefined) {
        setPreviewImage(null);
      }

      return true;
    } catch (err) {
      console.error('Error updating group theme:', err);
      setError('Failed to update group theme');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload hình ảnh theme
  const uploadThemeImage = async (file: File) => {
    if (!groupConversationId) return;

    // Cập nhật theme tạm thời với preview
    setTheme(prev => ({ 
      ...(prev || {}), 
      backgroundUrl: previewImage || undefined
    }));

    setIsUploading(true);
    try {
      const downloadURL = await chatService.uploadGroupThemeImage(groupConversationId, file);
      
      // Xóa preview image
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading group theme image:', error);
      setError('Failed to upload group theme image');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Hàm xem trước hình ảnh (chỉ ở front-end)
  const previewThemeImage = (file: File) => {
    try {
      // Xóa preview cũ nếu có
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }

      // Tạo URL xem trước mới
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      return previewUrl;
    } catch (err) {
      console.error('Error creating preview:', err);
      return null;
    }
  };

  // Hàm hủy xem trước
  const cancelPreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
  };

  // Reset theme về mặc định
  const resetTheme = async () => {
    if (!groupConversationId) return;

    // Xóa preview nếu có
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }

    // Áp dụng theme mặc định tạm thời
    const defaultTheme = {
      backgroundColor: '#ffffff',
      backgroundUrl: '',
      textColor: '#000000',
    };
    setTheme(defaultTheme);

    try {
      await chatService.updateGroupConversationTheme(groupConversationId, defaultTheme);
    } catch (error) {
      console.error('Error resetting group theme:', error);
      setError('Failed to reset group theme');
    }
  };

  // Kết hợp theme từ server với preview local
  const displayTheme = previewImage
    ? { ...(theme || {}), backgroundUrl: previewImage }
    : theme;

  return {
    theme: displayTheme,
    loading,
    error,
    isUploading,
    updateTheme,
    uploadThemeImage,
    previewThemeImage,
    cancelPreview,
    resetTheme,
    hasPreview: !!previewImage,
  };
}