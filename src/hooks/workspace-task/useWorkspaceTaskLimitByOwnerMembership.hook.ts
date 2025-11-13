import { useAppSelector } from '../../store/hooks';
import {
  getWorkspaceTaskMembershipType,
  getWorkspaceTaskLimit,
  getRemainingWorkspaceTasks,
  canCreateWorkspaceTask as canCreateWorkspaceTaskUtil,
  MembershipType,
  getWorkspaceTaskMembershipDescription,
} from '../../utils/workspace-task/membership-workspace-task-limit.util';

/**
 * Hook to get workspace task limit based on workspace owner's membership level
 * Daily workspace task limit (per day creation/import for each workspace)
 * 
 * Synced with backend membership logic:
 * Mapping from workspace owner's membership:
 * - hasActiveMembership: false → FREE - 10 tasks/day
 * - hasActiveMembership: true + level: 0 → BASIC - 20 tasks/day
 * - hasActiveMembership: true + level: 1 → PLUS - 50 tasks/day
 * - hasActiveMembership: true + level: 2 → BUSINESS - Unlimited tasks/day
 * 
 * @param ownerMembershipLevel - Workspace owner's membership level
 * @param ownerHasActiveMembership - Whether workspace owner has active membership
 */
export const useWorkspaceTaskLimitByOwnerMembership = (
  ownerMembershipLevel?: number,
  ownerHasActiveMembership?: boolean
) => {
  // Use owner's membership info if provided, otherwise use current user's info as fallback
  const user = useAppSelector((state) => state.auth.user);
  
  const finalHasActiveMembership = ownerHasActiveMembership ?? user?.membership?.hasActiveMembership ?? false;
  const finalMembershipLevel = ownerMembershipLevel ?? user?.membership?.level ?? 0;

  // Get membership type using utility
  const membershipType = getWorkspaceTaskMembershipType(finalMembershipLevel, finalHasActiveMembership);
  
  // Get task limit
  const taskLimit = getWorkspaceTaskLimit(membershipType);
  const isUnlimited = !isFinite(taskLimit);

  // Helper function to check remaining tasks
  const getWorkspaceTaskLimitInfo = (tasksCreatedToday: number) => {
    return {
      limit: taskLimit,
      remaining: getRemainingWorkspaceTasks(tasksCreatedToday, membershipType),
      canCreate: canCreateWorkspaceTaskUtil(tasksCreatedToday, membershipType),
    };
  };

  return {
    // Membership info
    membershipType,
    membershipLevel: finalMembershipLevel,
    hasActiveMembership: finalHasActiveMembership,
    
    // Limit info
    taskLimit,
    isUnlimited,
    
    // Helpers
    getWorkspaceTaskLimitInfo,
    getMembershipDescription: () => getWorkspaceTaskMembershipDescription(membershipType),
    
    // Legacy support (for backward compatibility)
    getTaskLimit: (internalLevel: number): number => {
      const internalType = getWorkspaceTaskMembershipType(internalLevel, true);
      return getWorkspaceTaskLimit(internalType);
    },
  };
};
