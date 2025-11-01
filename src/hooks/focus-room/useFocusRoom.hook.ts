import { useEffect, useState } from 'react';
import focusRoomService, {
  FocusRoomResponse,
} from '../../services/focusRoom.service';
import focusRoomPermissionService, {
  PermissionResponse,
} from '../../services/focusRoomPermission.service';
import livekitTokenService from '../../services/livekitToken.service';

export const useFocusRoom = (workspaceId?: string) => {
  const [rooms, setRooms] = useState<FocusRoomResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<FocusRoomResponse | null>(
    null
  );
  const [canCreateRoom, setCanCreateRoom] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(false);
  const [permission, setPermission] = useState<PermissionResponse | null>(null);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);

  const checkPermissions = async (wsId?: string) => {
    const targetId = wsId || workspaceId;
    if (!targetId) {
      setCanCreateRoom(false);
      return;
    }

    setCheckingPermission(true);
    try {
      const perm =
        await focusRoomPermissionService.checkCreateRoomPermission(targetId);
      setPermission(perm);
      const hasCreatePermission =
        focusRoomPermissionService.canCreateRoom(perm);
      setCanCreateRoom(hasCreatePermission);
    } catch (err) {
      console.error('Error checking permissions:', err);
      setCanCreateRoom(false);
    } finally {
      setCheckingPermission(false);
    }
  };

  const createRoom = async (formData: {
    name: string;
    workspace_id?: string | null;
    access_type: 'public' | 'private';
    password?: string;
    description?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const res = await focusRoomService.createRoom(formData);
      return res;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to create room';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (
    roomId: string,
    password?: string,
    joinType?: 'password' | 'request'
  ) => {
    try {
      setLoading(true);
      setError(null);
      setIsWaitingForApproval(false);

      const room = rooms.find(r => r._id === roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      if (joinType === 'request') {
        try {
          await livekitTokenService.getJoinToken(roomId, password, joinType);
        } catch (err) {
          console.log('Request sent');
        }
      } else {
        const response = await livekitTokenService.getJoinToken(
          roomId,
          password,
          joinType
        );

        if (response.token) {
          setToken(response.token);
          setCurrentRoom(room);
          setIsWaitingForApproval(false);
        } else if (response.requiresPassword) {
          throw new Error('Room yêu cầu password hoặc gửi yêu cầu tham gia');
        } else {
          throw new Error(response.message || 'Cannot join room');
        }
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Cannot join room';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);

      // If joinType is 'request', always show waiting screen in finally
      if (joinType === 'request') {
        setIsWaitingForApproval(true);
        setCurrentRoom(rooms.find(r => r._id === roomId) || null);
      }
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      let data: FocusRoomResponse[] = [];

      if (workspaceId) {
        data = await focusRoomService.getRoomsByWorkspace(workspaceId);
      } else {
        data = await focusRoomService.getPublicRooms();
      }

      setRooms(data);
    } catch (err: any) {
      console.error('Error fetching rooms:', err);
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    checkPermissions();
  }, [workspaceId]);

  return {
    rooms,
    loading,
    error,
    refresh: fetchRooms,
    joinRoom,
    createRoom,
    token,
    setToken,
    currentRoom,
    canCreateRoom,
    checkingPermission,
    permission,
    checkPermissions,
    isWaitingForApproval,
    setIsWaitingForApproval,
    setCurrentRoom,
  };
};
