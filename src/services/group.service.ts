import { ApiResponse } from '../types/api/api.interface';
import { UserResponse } from '../types/auth/auth.types';
import api from './api.service';
import { ref, update, get, push, remove, set, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../firebase';
import {
  GroupConversationType,
  CreateGroupRequest,
  UpdateGroupRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  RemoveMemberRequest,
  GroupInvitation,
  GroupMember,
  GroupMemberRole,
  GroupMemberStatus,
  GroupSettings,
  GroupActivity,
  GroupActivityType
} from '../types/chat/GroupConversationType';

class GroupService {
  /**
   * Tạo nhóm chat mới
   */
  async createGroup(request: CreateGroupRequest): Promise<string | null> {
    try {
      console.log('=== GROUP CREATION STARTED ===');
      console.log('localStorage contents:', localStorage);
      
      // Test Firebase connection first
      console.log('Testing Firebase connection...');
      console.log('Firebase db object:', db);
      
      const userId = localStorage.getItem('user_id');
      console.log('Retrieved user ID:', userId);
      
      if (!userId) {
        console.error('User not logged in');
        return null;
      }

      // Test creating a reference first
      console.log('Creating Firebase reference...');
      const testRef = ref(db, 'conversations');
      console.log('Test reference created:', testRef);

      // Tạo ID cho nhóm mới
      console.log('Generating group ID...');
      const groupRef = push(testRef);
      const groupId = groupRef.key;
      console.log('Generated group ID:', groupId);
      
      if (!groupId) {
        console.error('Failed to generate group ID');
        return null;
      }

      // Tạo thông tin thành viên
      const groupMembers: { [userId: string]: GroupMember } = {};
      
      // Thêm người tạo nhóm làm admin
      groupMembers[userId] = {
        userId,
        role: GroupMemberRole.ADMIN,
        status: GroupMemberStatus.ACTIVE,
        joinedAt: Date.now(),
        invitedBy: userId
      };

      // Thêm các thành viên khác
      request.memberIds.forEach(memberId => {
        if (memberId !== userId) {
          groupMembers[memberId] = {
            userId: memberId,
            role: GroupMemberRole.MEMBER,
            status: GroupMemberStatus.ACTIVE,
            joinedAt: Date.now(),
            invitedBy: userId
          };
        }
      });

      // Tạo members map cho compatibility với ConversationType
      const members: { [userId: string]: true } = {};
      Object.keys(groupMembers).forEach(memberId => {
        members[memberId] = true;
      });

      // Cài đặt mặc định - loại bỏ các giá trị undefined
      const defaultSettings: GroupSettings = {
        allowMemberInvite: true,
        allowMemberLeave: true,
        requireApprovalToJoin: false,
        maxMembers: 100,
        isPublic: false
      };

      // Merge settings an toàn, chỉ thêm các giá trị không undefined
      if (request.settings) {
        Object.keys(request.settings).forEach(key => {
          const value = request.settings![key as keyof GroupSettings];
          if (value !== undefined) {
            (defaultSettings as any)[key] = value;
          }
        });
      }

      const groupData: GroupConversationType = {
        id: groupId,
        type: 'group',
        name: request.name,
        description: request.description || '',
        members,
        groupMembers,
        settings: defaultSettings,
        createdBy: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        stats: {
          totalMessages: 0,
          activeMembers: Object.keys(groupMembers).length,
          lastActivityAt: Date.now()
        }
      };

      // Chỉ thêm avatar nếu có giá trị
      if (request.avatar) {
        groupData.avatar = request.avatar;
      }

      // Lưu vào Firebase
      await set(ref(db, `groupConversations/${groupId}`), groupData);

      // Ghi log hoạt động
      await this.logGroupActivity(groupId, GroupActivityType.GROUP_CREATED, userId);

      return groupId;
    } catch (error) {
      console.error('Error creating group:', error);
      return null;
    }
  }

  /**
   * Cập nhật thông tin nhóm
   */
  async updateGroup(groupId: string, request: UpdateGroupRequest): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Kiểm tra quyền admin
      const hasPermission = await this.checkAdminPermission(groupId, userId);
      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }

      const updates: any = {
        updatedAt: Date.now()
      };

      if (request.name) updates.name = request.name;
      if (request.description !== undefined) updates.description = request.description;
      if (request.avatar !== undefined) updates.avatar = request.avatar;
      if (request.settings) {
        updates.settings = request.settings;
      }

      await update(ref(db, `groupConversations/${groupId}`), updates);

      // Ghi log hoạt động
      await this.logGroupActivity(groupId, GroupActivityType.GROUP_UPDATED, userId);

      return true;
    } catch (error) {
      console.error('Error updating group:', error);
      return false;
    }
  }

  /**
   * Mời thành viên vào nhóm
   */
  async inviteMembers(request: InviteMemberRequest): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Kiểm tra quyền mời
      const hasPermission = await this.checkInvitePermission(request.groupId, userId);
      if (!hasPermission) {
        throw new Error('Insufficient permissions to invite members');
      }

      // Lấy thông tin nhóm hiện tại
      const groupSnapshot = await get(ref(db, `groupConversations/${request.groupId}`));
      const groupData = groupSnapshot.val() as GroupConversationType;

      if (!groupData) {
        throw new Error('Group not found');
      }

      // Kiểm tra giới hạn thành viên
      const currentMemberCount = Object.keys(groupData.groupMembers || {}).length;
      if (currentMemberCount + request.userIds.length > groupData.settings.maxMembers) {
        throw new Error('Exceeds maximum member limit');
      }

      const updates: any = {};

      // Thêm thành viên mới
      request.userIds.forEach(memberId => {
        if (!groupData.groupMembers[memberId]) {
          // Thêm vào groupMembers
          updates[`groupMembers/${memberId}`] = {
            userId: memberId,
            role: GroupMemberRole.MEMBER,
            status: GroupMemberStatus.ACTIVE,
            joinedAt: Date.now(),
            invitedBy: userId
          };

          // Thêm vào members (compatibility)
          updates[`members/${memberId}`] = true;
        }
      });

      // Cập nhật stats
      updates['stats/activeMembers'] = currentMemberCount + request.userIds.length;
      updates['updatedAt'] = Date.now();

      await update(ref(db, `groupConversations/${request.groupId}`), updates);

      // Ghi log hoạt động cho từng thành viên mới
      for (const memberId of request.userIds) {
        await this.logGroupActivity(request.groupId, GroupActivityType.MEMBER_JOINED, userId, memberId);
      }

      return true;
    } catch (error) {
      console.error('Error inviting members:', error);
      return false;
    }
  }

  /**
   * Xóa thành viên khỏi nhóm
   */
  async removeMember(request: RemoveMemberRequest): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Kiểm tra quyền admin
      const hasPermission = await this.checkAdminPermission(request.groupId, userId);
      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }

      // Không thể xóa chính mình
      if (request.userId === userId) {
        throw new Error('Cannot remove yourself');
      }

      const updates: any = {};

      // Xóa hoàn toàn khỏi groupMembers
      updates[`groupMembers/${request.userId}`] = null;

      // Xóa khỏi members (compatibility)
      updates[`members/${request.userId}`] = null;

      updates['updatedAt'] = Date.now();

      await update(ref(db, `groupConversations/${request.groupId}`), updates);

      // Ghi log hoạt động
      await this.logGroupActivity(request.groupId, GroupActivityType.MEMBER_REMOVED, userId, request.userId);

      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      return false;
    }
  }

  /**
   * Rời khỏi nhóm
   */
  async leaveGroup(groupId: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Kiểm tra quyền rời nhóm
      const groupSnapshot = await get(ref(db, `groupConversations/${groupId}`));
      const groupData = groupSnapshot.val() as GroupConversationType;

      if (!groupData || !groupData.settings.allowMemberLeave) {
        throw new Error('Leaving group is not allowed');
      }

      const updates: any = {};

      // Xóa hoàn toàn khỏi groupMembers
      updates[`groupMembers/${userId}`] = null;

      // Xóa khỏi members (compatibility)
      updates[`members/${userId}`] = null;

      updates['updatedAt'] = Date.now();

      await update(ref(db, `groupConversations/${groupId}`), updates);

      // Ghi log hoạt động
      await this.logGroupActivity(groupId, GroupActivityType.MEMBER_LEFT, userId);

      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      return false;
    }
  }

  /**
   * Cập nhật vai trò thành viên
   */
  async updateMemberRole(request: UpdateMemberRoleRequest): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Kiểm tra quyền admin
      const hasPermission = await this.checkAdminPermission(request.groupId, userId);
      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }

      const updates: any = {};
      updates[`groupMembers/${request.userId}/role`] = request.newRole;
      updates['updatedAt'] = Date.now();

      await update(ref(db, `groupConversations/${request.groupId}`), updates);

      // Ghi log hoạt động
      const activityType = request.newRole === GroupMemberRole.ADMIN || request.newRole === GroupMemberRole.MODERATOR
        ? GroupActivityType.MEMBER_PROMOTED
        : GroupActivityType.MEMBER_DEMOTED;

      await this.logGroupActivity(request.groupId, activityType, userId, request.userId);

      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      return false;
    }
  }

  /**
   * Kiểm tra quyền admin
   */
  private async checkAdminPermission(groupId: string, userId: string): Promise<boolean> {
    try {
      console.log('Checking admin permission for:', { groupId, userId });
      const memberSnapshot = await get(ref(db, `groupConversations/${groupId}/groupMembers/${userId}`));
      const member = memberSnapshot.val() as GroupMember;
      
      console.log('Member data from Firebase:', member);
      console.log('Required role:', GroupMemberRole.ADMIN);
      console.log('Required status:', GroupMemberStatus.ACTIVE);
      
      const hasPermission = member && member.role === GroupMemberRole.ADMIN && member.status === GroupMemberStatus.ACTIVE;
      console.log('Has admin permission:', hasPermission);
      
      return hasPermission;
    } catch (error) {
      console.error('Error checking admin permission:', error);
      return false;
    }
  }

  /**
   * Kiểm tra quyền mời thành viên
   */
  private async checkInvitePermission(groupId: string, userId: string): Promise<boolean> {
    try {
      const groupSnapshot = await get(ref(db, `groupConversations/${groupId}`));
      const groupData = groupSnapshot.val() as GroupConversationType;
      
      if (!groupData) return false;

      const member = groupData.groupMembers[userId];
      if (!member || member.status !== GroupMemberStatus.ACTIVE) return false;

      // Admin luôn có quyền mời
      if (member.role === GroupMemberRole.ADMIN) return true;

      // Kiểm tra cài đặt nhóm
      return groupData.settings.allowMemberInvite;
    } catch (error) {
      console.error('Error checking invite permission:', error);
      return false;
    }
  }

  /**
   * Ghi log hoạt động nhóm
   */
  private async logGroupActivity(
    groupId: string,
    type: GroupActivityType,
    performedBy: string,
    targetUserId?: string
  ): Promise<void> {
    try {
      const activityId = push(ref(db, `groupActivities/${groupId}`)).key;
      if (!activityId) return;

      const activity: GroupActivity = {
        id: activityId,
        groupId,
        type,
        performedBy,
        targetUserId,
        createdAt: Date.now()
      };

      await set(ref(db, `groupActivities/${groupId}/${activityId}`), activity);
    } catch (error) {
      console.error('Error logging group activity:', error);
    }
  }

  /**
   * Lấy danh sách hoạt động nhóm
   */
  async getGroupActivities(groupId: string, limit: number = 50): Promise<GroupActivity[]> {
    try {
      const activitiesRef = ref(db, `groupActivities/${groupId}`);
      const activitiesQuery = query(activitiesRef, orderByChild('createdAt'));
      
      const snapshot = await get(activitiesQuery);
      const activities: GroupActivity[] = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          activities.push(child.val());
        });
      }

      return activities.reverse().slice(0, limit);
    } catch (error) {
      console.error('Error getting group activities:', error);
      return [];
    }
  }

  /**
   * Tải lên avatar nhóm
   */
  async uploadGroupAvatar(groupId: string, file: File): Promise<string | null> {
    try {
      console.log('GroupService.uploadGroupAvatar called with:', { groupId, fileName: file.name });
      
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.error('User not logged in');
        throw new Error('User not logged in');
      }

      console.log('Checking admin permission for user:', userId);
      // Kiểm tra quyền admin
      const hasPermission = await this.checkAdminPermission(groupId, userId);
      if (!hasPermission) {
        console.error('Insufficient permissions for user:', userId);
        throw new Error('Insufficient permissions');
      }

      console.log('Creating FormData...');
      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('file', file);

      console.log('Making API call to /core/profile/avatar...');
      // Sử dụng endpoint user avatar tạm thời cho group avatar
      const response = await api.post<any>(
        '/core/profile/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('API response:', response.data);

      if (response.data && response.data.data && response.data.data.avatar) {
        const avatarUrl = response.data.data.avatar;
        console.log('Avatar URL received:', avatarUrl);
        
        console.log('Updating Firebase...');
        // Cập nhật avatar trong Firebase
        await update(ref(db, `groupConversations/${groupId}`), {
          avatar: avatarUrl,
          updatedAt: Date.now()
        });

        console.log('Logging group activity...');
        // Ghi log hoạt động
        await this.logGroupActivity(groupId, GroupActivityType.GROUP_UPDATED, userId);

        console.log('Upload completed successfully');
        return avatarUrl;
      }

      console.error('Invalid response structure:', response.data);
      return null;
    } catch (error) {
      console.error('Error uploading group avatar:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  }

  /**
   * Xóa avatar nhóm
   */
  async removeGroupAvatar(groupId: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Kiểm tra quyền admin
      const hasPermission = await this.checkAdminPermission(groupId, userId);
      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }

      // Cập nhật Firebase để xóa avatar
      await update(ref(db, `groupConversations/${groupId}`), {
        avatar: null,
        updatedAt: Date.now()
      });

      // Ghi log hoạt động
      await this.logGroupActivity(groupId, GroupActivityType.GROUP_UPDATED, userId);

      return true;
    } catch (error) {
      console.error('Error removing group avatar:', error);
      return false;
    }
  }

  /**
   * Cập nhật tên nhóm
   */
  async updateGroupName(groupId: string, name: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Kiểm tra quyền admin
      const hasPermission = await this.checkAdminPermission(groupId, userId);
      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }

      // Validate tên nhóm
      if (!name || name.trim().length === 0) {
        throw new Error('Group name cannot be empty');
      }

      if (name.trim().length > 100) {
        throw new Error('Group name too long (max 100 characters)');
      }

      // Cập nhật tên trong Firebase
      await update(ref(db, `groupConversations/${groupId}`), {
        name: name.trim(),
        updatedAt: Date.now()
      });

      // Ghi log hoạt động
      await this.logGroupActivity(groupId, GroupActivityType.GROUP_UPDATED, userId);

      return true;
    } catch (error) {
      console.error('Error updating group name:', error);
      return false;
    }
  }

  /**
   * Cập nhật mô tả nhóm
   */
  async updateGroupDescription(groupId: string, description: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      // Kiểm tra quyền admin
      const hasPermission = await this.checkAdminPermission(groupId, userId);
      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }

      // Validate mô tả
      if (description && description.length > 500) {
        throw new Error('Description too long (max 500 characters)');
      }

      // Cập nhật mô tả trong Firebase
      await update(ref(db, `groupConversations/${groupId}`), {
        description: description?.trim() || '',
        updatedAt: Date.now()
      });

      // Ghi log hoạt động
      await this.logGroupActivity(groupId, GroupActivityType.GROUP_UPDATED, userId);

      return true;
    } catch (error) {
      console.error('Error updating group description:', error);
      return false;
    }
  }
}

export default new GroupService();