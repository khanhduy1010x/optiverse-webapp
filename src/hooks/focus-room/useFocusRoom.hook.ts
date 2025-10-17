import { useEffect, useState } from 'react';
import focusRoomService, {
  FocusRoomResponse,
} from '../../services/focusRoom.service';

export const useFocusRoom = () => {
  const [rooms, setRooms] = useState<FocusRoomResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const joinRoom = async (roomId: string, password?: string) => {
    try {
      setLoading(true);
      const res = await focusRoomService.joinRoom({ roomId, password });
      setToken(res.token);
    } catch (err: any) {
      setError(err.message || 'Cannot join room');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await focusRoomService.getPublicRooms();
      setRooms(data);
    } catch (err: any) {
      console.error('❌ Error fetching public rooms:', err);
      setError(err.message || 'Lỗi khi tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    refresh: fetchRooms,
    joinRoom,
    token,
  };
};
