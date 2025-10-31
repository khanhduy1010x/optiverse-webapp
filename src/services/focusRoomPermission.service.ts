import api from './api.service';

export interface PermissionResponse {
  hasPermission: boolean;
  actions: string[];
  is_owner: boolean;
  message: string;
}

class FocusRoomPermissionService {
  async checkCreateRoomPermission(
    workspaceId: string
  ): Promise<PermissionResponse> {
    try {
      const response = await api.get(
        `/productivity/focus-room/permissions/${workspaceId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error checking permissions:', error);
      throw error;
    }
  }

  canCreateRoom(permission: PermissionResponse): boolean {
    return permission.is_owner || permission.actions.includes('ROOM_ADMIN');
  }

  canManageRoom(permission: PermissionResponse): boolean {
    return permission.is_owner || permission.actions.includes('ROOM_ADMIN');
  }

  canEditRoom(permission: PermissionResponse): boolean {
    return permission.is_owner || permission.actions.includes('ROOM_ADMIN');
  }

  canJoinRoom(permission: PermissionResponse): boolean {
    // Joining is not permission-bypassed; UI can use this as a generic access flag
    return permission.hasPermission;
  }

  canRecordRoom(permission: PermissionResponse): boolean {
    return permission.is_owner || permission.actions.includes('ROOM_ADMIN');
  }
}

export default new FocusRoomPermissionService();
