import api from './api.service';
import {
  SharedWithUser,
  ShareResource,
  ShareResponse,
} from '../types/note/share.types';
import { RootItem } from '../types/note/note.types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface ShareRequestUser {
  user_id: string;
  permission: 'view' | 'edit';
}

class ShareService {
  static async shareResource(
    resourceType: 'note' | 'folder',
    resourceId: string,
    sharedWith: ShareRequestUser[]
  ): Promise<ShareResponse> {
    const response = await api.post(
      `/productivity/shares/${resourceType}/${resourceId}`,
      {
        users: sharedWith,
      }
    );
    return response.data?.data || response.data;
  }

  static async updateSharedUsers(
    resourceType: 'note' | 'folder',
    resourceId: string,
    sharedWith: ShareRequestUser[]
  ): Promise<ShareResponse> {
    const response = await api.put(
      `/productivity/shares/${resourceType}/${resourceId}`,
      {
        users: sharedWith,
      }
    );
    return response.data?.data || response.data;
  }

  static async removeUserFromShare(
    resourceType: 'note' | 'folder',
    resourceId: string,
    userId: string
  ): Promise<ShareResponse> {
    const response = await api.delete(
      `/productivity/shares/${resourceType}/${resourceId}/user/${userId}`
    );
    return response.data?.data || response.data;
  }

  static async leaveSharedResource(
    resourceType: 'note' | 'folder',
    resourceId: string
  ): Promise<void> {
    await api.delete(
      `/productivity/shares/${resourceType}/${resourceId}/leave`
    );
  }

  static async getSharedWithMe(): Promise<RootItem[]> {
    const response = await api.get<ApiResponse<RootItem[]>>(
      '/productivity/shares/shared-with-me'
    );
    console.log('API response:', response);
    return response.data?.data || response.data;
  }

  static async getMySharedItems(): Promise<ShareResponse[]> {
    const response = await api.get('/productivity/shares/my-shared');
    return response.data?.data || response.data;
  }

  static async getSharedResourceDetail(
    resourceType: 'note' | 'folder',
    resourceId: string
  ): Promise<RootItem | null> {
    const response = await api.get(
      `/productivity/shares/shared-resource/${resourceType}/${resourceId}`
    );
    return response.data?.data || response.data;
  }
}

export default ShareService;
