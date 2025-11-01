import { useState } from 'react';
import FocusRoomSocket from '../../services/focus-room.socket';
import focusRoomService from '../../services/focusRoom.service';

interface CreateRoomForm {
  title: string;
  description?: string;
  type: 'public' | 'private';
  accessMode: 'free' | 'approval' | 'password';
  password?: string;
  duration?: number;
  maxParticipants?: number;
  tags?: string[];
  autoStartTimer?: boolean;
  allowMic?: boolean;
  allowCamera?: boolean;
  isRecordingEnabled?: boolean;
}

export const useCreateFocusRoom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const createRoom = async (formData: CreateRoomForm) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        tags:
          formData.tags && typeof formData.tags === 'string'
            ? formData.tags.split(',').map(tag => tag.trim())
            : formData.tags || [],
      };

      const result = await focusRoomService.createRoom(payload);

      FocusRoomSocket.emitCreateRoom(result);

      setSuccess(true);
      return result;
    } catch (err: any) {
      console.error('❌ Lỗi khi tạo phòng:', err);
      setError(err.message || 'Lỗi khi tạo phòng');
    } finally {
      setLoading(false);
    }
  };

  return {
    createRoom,
    loading,
    error,
    success,
  };
};
