import { ApiResponse } from '../types/api/api.interface';
import {
  Workspace,
  WorkspaceMember,
  WorkspaceJoinRequest,
  MyWorkspaceItem,
  MyWorkspacesResponse,
  WorkspaceDetailDto,
  WorkspaceSearchResponse,
} from '../types/workspace/response/workspace.response';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  JoinWorkspaceDto,
} from '../types/workspace/request/workspace.request';
import api from './api.service';

const URLBASE = 'productivity/workspace';

class WorkspaceServiceClass {
  async getWorkspaceLimits(): Promise<{
    current: number;
    max: number;
    canCreateMore: boolean;
    membershipLevel: string;
    packageName?: string;
  }> {
    try {
      const response = await api.get<
        ApiResponse<{
          current: number;
          max: number;
          canCreateMore: boolean;
          membershipLevel: string;
          packageName?: string;
        }>
      >(`${URLBASE}/creation-limits`);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch workspace limits:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not fetch workspace limits');
    }
  }

  async createWorkspace(
    createWorkspaceDto: CreateWorkspaceDto
  ): Promise<Workspace> {
    try {
      const response = await api.post<ApiResponse<Workspace>>(
        `${URLBASE}`,
        createWorkspaceDto
      );

      console.log('Created workspace:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create workspace:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not create workspace ${createWorkspaceDto.name}`);
    }
  }

  async getMyWorkspaces(): Promise<MyWorkspacesResponse> {
    try {
      const response = await api.get<ApiResponse<MyWorkspacesResponse>>(
        `${URLBASE}/my-workspaces`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch my workspaces:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not fetch workspaces');
    }
  }

  async getWorkspaceById(workspaceId: string): Promise<WorkspaceDetailDto> {
    try {
      const response = await api.get<ApiResponse<WorkspaceDetailDto>>(
        `${URLBASE}/${workspaceId}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error(`Failed to fetch workspace ${workspaceId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not fetch workspace');
    }
  }

  async getWorkspaceBasicInfo(workspaceId: string): Promise<Workspace> {
    try {
      const response = await api.get<ApiResponse<Workspace>>(
        `${URLBASE}/${workspaceId}/basic`
      );
      return response.data.data;
    } catch (error: any) {
      console.error(`Failed to fetch workspace basic info ${workspaceId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not fetch workspace basic info');
    }
  }

  async verifyWorkspaceAccess(
    workspaceId: string
  ): Promise<{ hasAccess: boolean }> {
    try {
      const response = await api.get<ApiResponse<{ hasAccess: boolean }>>(
        `${URLBASE}/${workspaceId}/verify-access`
      );
      return response.data.data;
    } catch (error: any) {
      console.error(`Failed to verify workspace access ${workspaceId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not verify workspace access');
    }
  }

  async updateWorkspace(
    workspaceId: string,
    updateData: UpdateWorkspaceDto
  ): Promise<Workspace> {
    try {
      const response = await api.put<ApiResponse<Workspace>>(
        `${URLBASE}/${workspaceId}`,
        updateData
      );

      console.log('Updated workspace:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error(`Failed to update workspace ${workspaceId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not update workspace');
    }
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      await api.delete(`${URLBASE}/${workspaceId}`);
      console.log('Deleted workspace:', workspaceId);
    } catch (error: any) {
      console.error(`Failed to delete workspace ${workspaceId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not delete workspace');
    }
  }

  async leaveWorkspace(
    workspaceId: string,
    newOwnerId?: string
  ): Promise<void> {
    try {
      const body: { newOwnerId?: string } = {};
      if (newOwnerId) body.newOwnerId = newOwnerId;

      await api.post(`${URLBASE}/${workspaceId}/leave`, body);
      console.log('Left workspace:', workspaceId, { newOwnerId });
    } catch (error: any) {
      console.error(`Failed to leave workspace ${workspaceId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not leave workspace');
    }
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    try {
      const response = await api.get<ApiResponse<WorkspaceMember[]>>(
        `${URLBASE}/${workspaceId}/members`
      );
      return response.data.data;
    } catch (error: any) {
      console.error(`Failed to fetch members for workspace ${workspaceId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not fetch workspace members');
    }
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: 'admin' | 'user'
  ): Promise<void> {
    try {
      await api.post(`${URLBASE}/${workspaceId}/update-member-role`, {
        userId,
        role,
      });
      console.log('Updated member role:', { workspaceId, userId, role });
    } catch (error: any) {
      console.error(
        `Failed to update member role in workspace ${workspaceId}:`,
        {
          error: error.message,
          response: error.response?.data,
        }
      );
      throw new Error('Could not update member role');
    }
  }

  async banMember(
    workspaceId: string,
    userId: string
  ): Promise<WorkspaceMember> {
    try {
      const response = await api.put<ApiResponse<WorkspaceMember>>(
        `${URLBASE}/${workspaceId}/members/${userId}/ban`
      );

      console.log('Banned member:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error(`Failed to ban member in workspace ${workspaceId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not ban member');
    }
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    try {
      await api.delete(`${URLBASE}/${workspaceId}/members/${userId}`);
      console.log('Removed member from workspace:', { workspaceId, userId });
    } catch (error: any) {
      console.error(`Failed to remove member from workspace ${workspaceId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not remove member');
    }
  }

  async joinWorkspace(
    joinWorkspaceDto: JoinWorkspaceDto
  ): Promise<WorkspaceJoinRequest> {
    try {
      const response = await api.post<ApiResponse<WorkspaceJoinRequest>>(
        `${URLBASE}/join-with-request`,
        joinWorkspaceDto
      );

      console.log('Join request sent:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to join workspace:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not join workspace');
    }
  }

  async getPendingJoinRequests(
    workspaceId: string
  ): Promise<WorkspaceJoinRequest[]> {
    try {
      const response = await api.get<ApiResponse<WorkspaceJoinRequest[]>>(
        `${URLBASE}/${workspaceId}/join-requests`
      );
      return response.data.data;
    } catch (error: any) {
      console.error(
        `Failed to fetch join requests for workspace ${workspaceId}:`,
        {
          error: error.message,
          response: error.response?.data,
        }
      );
      throw new Error('Could not fetch join requests');
    }
  }

  async getMyInvitations(): Promise<WorkspaceJoinRequest[]> {
    try {
      const response = await api.get<ApiResponse<WorkspaceJoinRequest[]>>(
        `${URLBASE}/my-invitations`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch my invitations:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not fetch invitations');
    }
  }

  async getMyRequests(): Promise<WorkspaceJoinRequest[]> {
    try {
      const response = await api.get<ApiResponse<WorkspaceJoinRequest[]>>(
        `${URLBASE}/my-requests`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch my requests:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not fetch requests');
    }
  }

  async searchWorkspace(inviteCode: string): Promise<WorkspaceSearchResponse> {
    try {
      const response = await api.get<ApiResponse<WorkspaceSearchResponse>>(
        `${URLBASE}/search/${inviteCode}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to search workspace:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not search workspace');
    }
  }

  async joinWorkspaceWithPassword(
    inviteCode: string,
    password: string
  ): Promise<void> {
    await api.post(`${URLBASE}/join-with-password`, {
      invite_code: inviteCode,
      password: password,
    });
    console.log('Joined workspace with password:', inviteCode);
  }

  async acceptInvitation(invitationId: string): Promise<void> {
    try {
      await api.post(`${URLBASE}/invitations/${invitationId}/accept`);
      console.log('Accepted invitation:', invitationId);
    } catch (error: any) {
      console.error(`Failed to accept invitation ${invitationId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not accept invitation');
    }
  }

  async rejectInvitation(invitationId: string): Promise<void> {
    try {
      await api.post(`${URLBASE}/invitations/${invitationId}/reject`);
      console.log('Rejected invitation:', invitationId);
    } catch (error: any) {
      console.error(`Failed to reject invitation ${invitationId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not reject invitation');
    }
  }

  async cancelRequest(requestId: string): Promise<void> {
    try {
      await api.delete(`${URLBASE}/join-requests/${requestId}`);
      console.log('Cancelled join request:', requestId);
    } catch (error: any) {
      console.error(`Failed to cancel join request ${requestId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not cancel join request');
    }
  }

  async approveJoinRequest(workspaceId: string, userId: string): Promise<void> {
    try {
      await api.post(`${URLBASE}/${workspaceId}/join-requests/approve`, {
        userId,
      });
      console.log('Approved join request:', { workspaceId, userId });
    } catch (error: any) {
      console.error(`Failed to approve join request for user ${userId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not approve join request');
    }
  }

  async rejectJoinRequest(workspaceId: string, userId: string): Promise<void> {
    try {
      await api.post(`${URLBASE}/${workspaceId}/join-requests/reject`, {
        userId,
      });
      console.log('Rejected join request:', { workspaceId, userId });
    } catch (error: any) {
      console.error(`Failed to reject join request for user ${userId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not reject join request');
    }
  }

  async cancelInvitation(workspaceId: string, userId: string): Promise<void> {
    try {
      await api.post(`${URLBASE}/${workspaceId}/invitations/cancel`, {
        userId,
      });
      console.log('Cancelled invitation:', { workspaceId, userId });
    } catch (error: any) {
      console.error(`Failed to cancel invitation for user ${userId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not cancel invitation');
    }
  }

  async banUser(
    workspaceId: string,
    requestId?: string,
    userId?: string
  ): Promise<void> {
    try {
      const body: { requestId?: string; userId?: string } = {};
      if (requestId) body.requestId = requestId;
      if (userId) body.userId = userId;

      await api.post(`${URLBASE}/${workspaceId}/ban-user`, body);
      console.log('Banned user:', { workspaceId, requestId, userId });
    } catch (error: any) {
      console.error('Failed to ban user:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not ban user');
    }
  }

  async unbanUser(
    workspaceId: string,
    userId: string,
    action: 'remove' | 'unban'
  ): Promise<void> {
    try {
      await api.post(`${URLBASE}/${workspaceId}/unban-user`, {
        userId,
        action,
      });
      console.log('Unbanned user:', { workspaceId, userId, action });
    } catch (error: any) {
      console.error('Failed to unban user:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not unban user');
    }
  }

  async updateMemberPermissions(
    workspaceId: string,
    userId: string,
    permissions: string[]
  ): Promise<void> {
    try {
      await api.post(`${URLBASE}/${workspaceId}/update-member-permissions`, {
        userId,
        permissions,
      });
      console.log('Updated member permissions:', {
        workspaceId,
        userId,
        permissions,
      });
    } catch (error: any) {
      console.error('Failed to update member permissions:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not update permissions');
    }
  }

  async manageMemberPermissions(
    workspaceId: string,
    userId: string,
    permissions: string[],
    action: 'grant' | 'revoke' | 'set' = 'set'
  ): Promise<void> {
    try {
      await api.post(`${URLBASE}/${workspaceId}/manage-member-permissions`, {
        userId,
        permissions,
        action,
      });
      console.log('Managed member permissions:', {
        workspaceId,
        userId,
        permissions,
        action,
      });
    } catch (error: any) {
      console.error('Failed to manage member permissions:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not manage permissions');
    }
  }

  async removeMemberFromWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<void> {
    try {
      await api.post(`${URLBASE}/${workspaceId}/remove-member`, {
        userId,
      });
      console.log('Removed member from workspace:', {
        workspaceId,
        userId,
      });
    } catch (error: any) {
      console.error('Failed to remove member from workspace:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not remove member from workspace');
    }
  }

  async inviteMultipleUsers(
    workspaceId: string,
    userIds: string[],
    message?: string
  ): Promise<{
    successful: Array<{ email: string; requestId: string }>;
    failed: Array<{ email: string; reason: string }>;
    summary: { total: number; successful: number; failed: number };
  }> {
    try {
      const response = await api.post(
        `${URLBASE}/${workspaceId}/invite-multiple-users`,
        {
          userIds,
          message,
        }
      );

      console.log('Invited multiple users to workspace:', {
        workspaceId,
        userIds,
        result: response.data.data,
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Failed to invite multiple users to workspace:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not invite users to workspace');
    }
  }

  /**
   * ========== WORKSPACE CHAT METHODS - NEW ==========
   */

  /**
   * Get workspace chat info từ backend
   * Backend chỉ return metadata, frontend check Firebase
   */
  async getWorkspaceChat(
    workspaceId: string
  ): Promise<{ workspaceId: string; shouldCreate: boolean }> {
    try {
      const response = await api.get<
        ApiResponse<{ workspaceId: string; shouldCreate: boolean }>
      >(`${URLBASE}/${workspaceId}/chat`);

      return response.data.data;
    } catch (error: any) {
      console.error('Failed to get workspace chat info:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not get workspace chat info');
    }
  }

  /**
   * Signal backend để sync members
   */
  async syncWorkspaceChatMembers(
    workspaceId: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await api.post<ApiResponse<{ success: boolean }>>(
        `${URLBASE}/${workspaceId}/chat/sync-members`
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Failed to sync workspace chat members:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not sync workspace chat members');
    }
  }
}

// Tạo instance của class
const workspaceService = new WorkspaceServiceClass();

// Export instance làm default
export default workspaceService;
