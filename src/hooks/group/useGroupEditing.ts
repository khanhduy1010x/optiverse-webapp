import { useState, useCallback } from 'react';
import GroupService from '../../services/group.service';
import { GroupEditingState, GroupEditingActions } from '../../types/group/GroupSettingsType';

export const useGroupEditing = (groupId: string): GroupEditingState & GroupEditingActions => {
  
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = useCallback(async (file: File): Promise<boolean> => {
    if (!groupId) return false;
    
    setIsUploadingAvatar(true);
    setError(null);
    
    try {
      console.log('Starting avatar upload for group:', groupId);
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      const result = await GroupService.uploadGroupAvatar(groupId, file);
      console.log('Upload result:', result);
      
      if (result) {
        console.log('Avatar uploaded successfully:', result);
        return true;
      } else {
        console.error('Upload failed: No result returned');
        setError('Không thể tải lên avatar. Vui lòng thử lại.');
        return false;
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      setError('Không thể tải lên avatar. Vui lòng thử lại.');
      return false;
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [groupId]);

  const removeAvatar = useCallback(async (): Promise<boolean> => {
    try {
      setIsUploadingAvatar(true);
      setError(null);

      const success = await GroupService.removeGroupAvatar(groupId);
      
      if (success) {
        // Firebase realtime database sẽ tự động cập nhật UI thông qua listeners
        return true;
      } else {
        setError('Không thể xóa avatar. Vui lòng thử lại.');
        return false;
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      setError('Có lỗi xảy ra khi xóa avatar');
      return false;
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [groupId]);

  const updateName = useCallback(async (name: string): Promise<boolean> => {
    try {
      setIsUpdatingName(true);
      setError(null);

      const success = await GroupService.updateGroupName(groupId, name);
      
      if (success) {
        // Firebase realtime database sẽ tự động cập nhật UI thông qua listeners
        return true;
      } else {
        setError('Không thể cập nhật tên nhóm. Vui lòng thử lại.');
        return false;
      }
    } catch (error) {
      console.error('Error updating group name:', error);
      setError('Có lỗi xảy ra khi cập nhật tên nhóm');
      return false;
    } finally {
      setIsUpdatingName(false);
    }
  }, [groupId]);

  const updateDescription = useCallback(async (description: string): Promise<boolean> => {
    try {
      setIsUpdatingDescription(true);
      setError(null);

      const success = await GroupService.updateGroupDescription(groupId, description);
      
      if (success) {
        // Firebase realtime database sẽ tự động cập nhật UI thông qua listeners
        return true;
      } else {
        setError('Không thể cập nhật mô tả nhóm. Vui lòng thử lại.');
        return false;
      }
    } catch (error) {
      console.error('Error updating group description:', error);
      setError('Có lỗi xảy ra khi cập nhật mô tả nhóm');
      return false;
    } finally {
      setIsUpdatingDescription(false);
    }
  }, [groupId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isUploadingAvatar,
    isUpdatingName,
    isUpdatingDescription,
    error,
    
    // Actions
    uploadAvatar,
    removeAvatar,
    updateName,
    updateDescription,
    clearError
  };
};