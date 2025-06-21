import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../firebase';
import chatService from '../../services/chat.service';

/**
 * Hook để quản lý theme cho hội thoại
 * @param conversationId ID của hội thoại
 */
export function useConversationTheme(conversationId: string) {
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

  // Lắng nghe thay đổi theme của hội thoại
  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    const themeRef = ref(db, `conversations/${conversationId}/theme`);

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
        console.error('Error listening to theme changes:', err);
        setError('Không thể lắng nghe thay đổi theme');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  // Hàm cập nhật theme
  const updateTheme = async (newTheme: {
    backgroundUrl?: string;
    backgroundColor?: string;
    textColor?: string;
  }) => {
    if (!conversationId) return false;

    try {
      setLoading(true);
      await chatService.updateConversationTheme(conversationId, newTheme);

      // Nếu xóa backgroundUrl, cũng xóa preview
      if (newTheme.backgroundUrl === undefined) {
        setPreviewImage(null);
      }

      return true;
    } catch (err) {
      console.error('Error updating theme:', err);
      setError('Không thể cập nhật theme');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Hàm tải lên hình ảnh làm theme
  const uploadThemeImage = async (file: File) => {
    if (!conversationId) return null;

    try {
      setLoading(true);

      // Tạo URL xem trước cho người dùng
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Tải lên hình ảnh mới thông qua API
      const imageUrl = await chatService.uploadThemeImage(conversationId, file);

      // Sau khi tải lên thành công, xóa URL xem trước
      setPreviewImage(null);

      return imageUrl;
    } catch (err) {
      console.error('Error uploading theme image:', err);
      setError('Không thể tải lên hình ảnh');

      // Xóa preview nếu có lỗi
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa theme
  const resetTheme = async () => {
    if (!conversationId) return false;

    try {
      setLoading(true);

      // Xóa preview nếu có
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }

      // Cập nhật theme về null
      await chatService.updateConversationTheme(conversationId, {});
      return true;
    } catch (err) {
      console.error('Error resetting theme:', err);
      setError('Không thể xóa theme');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Kết hợp theme từ server với preview local
  const displayTheme = previewImage
    ? { ...theme, backgroundUrl: previewImage }
    : theme;

  return {
    theme: displayTheme,
    loading,
    error,
    updateTheme,
    uploadThemeImage,
    resetTheme,
    hasPreview: !!previewImage,
  };
}
