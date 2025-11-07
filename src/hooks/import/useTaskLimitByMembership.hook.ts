import { useAppSelector } from '../../store/hooks';
import {
  getMembershipType,
  getTaskLimit,
  getRemainingTasks,
  canCreateTask as canCreateTaskUtil,
  MembershipType,
  getMembershipDescription,
} from '../../utils/membership-task-limit.util';

/**
 * Hook to get task import limit based on membership level
 * Daily task limit (per day creation/import)
 * 
 * Synced with backend membership logic:
 * Mapping from user store (req.userInfo.membership):
 * - hasActiveMembership: false → FREE - 10 tasks/day
 * - hasActiveMembership: true + level: 0 → BASIC - 20 tasks/day
 * - hasActiveMembership: true + level: 1 → PLUS - 50 tasks/day
 * - hasActiveMembership: true + level: 2 → BUSINESS - Unlimited tasks/day
 */
export const useTaskLimitByMembership = () => {
  const user = useAppSelector((state) => state.auth.user);
  const hasActiveMembership = user?.membership?.hasActiveMembership ?? false;
  const membershipLevel = user?.membership?.level ?? 0;

  // Get membership type using utility
  const membershipType = getMembershipType(membershipLevel, hasActiveMembership);
  
  // Get task limit
  const taskLimit = getTaskLimit(membershipType);
  const isUnlimited = !isFinite(taskLimit);

  // Helper function to check remaining tasks
  const getTaskLimitInfo = (tasksCreatedToday: number) => {
    return {
      limit: taskLimit,
      remaining: getRemainingTasks(tasksCreatedToday, membershipType),
      canCreate: canCreateTaskUtil(tasksCreatedToday, membershipType),
    };
  };

  return {
    // Membership info
    membershipType,
    membershipLevel,
    hasActiveMembership,
    
    // Limit info
    taskLimit,
    isUnlimited,
    
    // Helpers
    getTaskLimitInfo,
    getMembershipDescription: () => getMembershipDescription(membershipType),
    
    // Legacy support (for backward compatibility)
    getTaskLimit: (internalLevel: number): number => {
      // Legacy internal level mapping (-1 = FREE, 0-2 = BASIC/PLUS/BUSINESS)
      const legacyMembershipType = internalLevel === -1 
        ? MembershipType.FREE 
        : getMembershipType(internalLevel, true);
      return getTaskLimit(legacyMembershipType);
    },
  };
};
