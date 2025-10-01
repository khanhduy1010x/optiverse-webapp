import { ref, update, remove, get } from 'firebase/database';
import { db } from '../firebase';
import { LeaveGroupRequest, LeaveGroupResponse } from '../types/group/GroupSettingsType';
import { GroupActivityType } from '../types/chat/GroupConversationType';
import groupService from './group.service';

class GroupSettingsService {
  /**
   * Rời khỏi nhóm
   */
  async leaveGroup(request: LeaveGroupRequest): Promise<LeaveGroupResponse> {
    try {
      const { groupId, userId, reason } = request;

      // Kiểm tra xem nhóm có tồn tại không
      const groupRef = ref(db, `groupConversations/${groupId}`);
      const groupSnapshot = await get(groupRef);
      
      if (!groupSnapshot.exists()) {
        return {
          success: false,
          message: 'Nhóm không tồn tại'
        };
      }

      const groupData = groupSnapshot.val();
      
      // Kiểm tra xem user có trong nhóm không
      if (!groupData.groupMembers || !groupData.groupMembers[userId]) {
        return {
          success: false,
          message: 'Bạn không phải thành viên của nhóm này'
        };
      }

      const member = groupData.groupMembers[userId];
      
      // Kiểm tra xem có phải admin cuối cùng không
      const adminMembers = Object.values(groupData.groupMembers).filter(
        (m: any) => m.role === 'admin' && m.status === 'active'
      );
      
      if (member.role === 'admin' && adminMembers.length === 1) {
        return {
          success: false,
          message: 'Bạn là admin cuối cùng của nhóm. Vui lòng chỉ định admin khác trước khi rời nhóm.'
        };
      }

      // Xóa hoàn toàn khỏi groupMembers và members
      const updates: any = {};
      updates[`groupConversations/${groupId}/groupMembers/${userId}`] = null;
      updates[`groupConversations/${groupId}/members/${userId}`] = null;

      // Cập nhật số lượng thành viên active
      const activeMemberCount = Object.values(groupData.groupMembers).filter(
        (m: any) => m.status === 'active' && m.userId !== userId
      ).length;
      
      updates[`groupConversations/${groupId}/stats/activeMembers`] = activeMemberCount;
      updates[`groupConversations/${groupId}/updatedAt`] = Date.now();

      // Thực hiện cập nhật
      await update(ref(db), updates);

      // Ghi log hoạt động
      await groupService.logGroupActivity(groupId, GroupActivityType.MEMBER_LEFT, userId);

      // Xóa các tin nhắn chưa đọc của user trong nhóm này
      const userMessagesRef = ref(db, `messages/${groupId}`);
      const messagesSnapshot = await get(userMessagesRef);
      
      if (messagesSnapshot.exists()) {
        const messagesData = messagesSnapshot.val();
        const messageUpdates: any = {};
        
        Object.keys(messagesData).forEach(messageId => {
          if (messagesData[messageId].readBy && messagesData[messageId].readBy[userId]) {
            messageUpdates[`messages/${groupId}/${messageId}/readBy/${userId}`] = null;
          }
        });
        
        if (Object.keys(messageUpdates).length > 0) {
          await update(ref(db), messageUpdates);
        }
      }

      return {
        success: true,
        message: 'Đã rời khỏi nhóm thành công'
      };

    } catch (error) {
      console.error('Error leaving group:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi rời nhóm. Vui lòng thử lại.'
      };
    }
  }

  /**
   * Kiểm tra quyền admin của user trong nhóm
   */
  async checkAdminPermission(groupId: string, userId: string): Promise<boolean> {
    try {
      const groupRef = ref(db, `groupConversations/${groupId}/groupMembers/${userId}`);
      const snapshot = await get(groupRef);
      
      if (!snapshot.exists()) return false;
      
      const member = snapshot.val();
      return member.role === 'admin' && member.status === 'active';
    } catch (error) {
      console.error('Error checking admin permission:', error);
      return false;
    }
  }

  /**
   * Lấy thông tin chi tiết của nhóm
   */
  async getGroupDetails(groupId: string) {
    try {
      const groupRef = ref(db, `groupConversations/${groupId}`);
      const snapshot = await get(groupRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return snapshot.val();
    } catch (error) {
      console.error('Error getting group details:', error);
      return null;
    }
  }

  /**
   * Cập nhật thông tin nhóm (chỉ admin)
   */
  async updateGroupInfo(groupId: string, userId: string, updates: any): Promise<boolean> {
    try {
      // Kiểm tra quyền admin
      const hasPermission = await this.checkAdminPermission(groupId, userId);
      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }

      const groupUpdates: any = {};
      
      // Chỉ cho phép cập nhật một số trường nhất định
      const allowedFields = ['name', 'description', 'avatar'];
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          groupUpdates[`groupConversations/${groupId}/${field}`] = updates[field];
        }
      });

      groupUpdates[`groupConversations/${groupId}/updatedAt`] = Date.now();

      await update(ref(db), groupUpdates);

      // Ghi log hoạt động
      await groupService.logGroupActivity(groupId, GroupActivityType.GROUP_UPDATED, userId);

      return true;
    } catch (error) {
      console.error('Error updating group info:', error);
      return false;
    }
  }
}

export default new GroupSettingsService();