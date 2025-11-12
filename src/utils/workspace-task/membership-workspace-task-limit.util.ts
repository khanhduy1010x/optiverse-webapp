/**
 * Workspace Task Limit Utility - Frontend
 * Sync với backend: a:\Study\SEM9\SEP\Optivers\full-app\productivity-service\src\workspace-task\utils\workspace-task-limit.util.ts
 * 
 * Membership Levels cho workspace task (dựa trên owner workspace):
 * - FREE: hasActiveMembership: false → 10 tasks/day
 * - BASIC: level: 0 (hasActiveMembership: true) → 20 tasks/day
 * - PLUS: level: 1 (hasActiveMembership: true) → 50 tasks/day
 * - BUSINESS: level: 2 (hasActiveMembership: true) → Unlimited
 */

export enum MembershipType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PLUS = 'PLUS',
  BUSINESS = 'BUSINESS',
}

export const WORKSPACE_TASK_LIMITS: Record<MembershipType, number> = {
  [MembershipType.FREE]: 10,
  [MembershipType.BASIC]: 20,
  [MembershipType.PLUS]: 50,
  [MembershipType.BUSINESS]: Infinity, // Unlimited
};

export const WORKSPACE_TASK_MEMBERSHIP_LEVEL_DESCRIPTIONS: Record<string, { name: string; dailyLimit: number | string }> = {
  free: { name: 'FREE', dailyLimit: 10 },
  basic: { name: 'BASIC', dailyLimit: 20 },
  plus: { name: 'PLUS', dailyLimit: 50 },
  business: { name: 'BUSINESS', dailyLimit: 'Unlimited' },
};

/**
 * Get membership type based on level and active status
 * Logic (dựa trên membership của owner workspace):
 * - Nếu hasActiveMembership: false → FREE (bất kể level)
 * - Nếu hasActiveMembership: true:
 *   - level: 0 → BASIC
 *   - level: 1 → PLUS
 *   - level: 2 → BUSINESS
 *   - level khác → FREE (invalid level)
 * 
 * @param membershipLevel - Level from backend (0=BASIC, 1=PLUS, 2=BUSINESS) của owner workspace
 * @param hasActiveMembership - Whether owner has active membership
 * @returns MembershipType enum value
 */
export function getWorkspaceTaskMembershipType(
  membershipLevel: number | string,
  hasActiveMembership: boolean
): MembershipType {
  // Priority: hasActiveMembership
  if (!hasActiveMembership) {
    return MembershipType.FREE;
  }

  // Parse level
  const level = typeof membershipLevel === 'string' ? parseInt(membershipLevel, 10) : membershipLevel;

  // Validate level
  if (!Number.isInteger(level) || level < 0 || level > 2) {
    return MembershipType.FREE;
  }

  // Map level to membership type
  switch (level) {
    case 0:
      return MembershipType.BASIC;
    case 1:
      return MembershipType.PLUS;
    case 2:
      return MembershipType.BUSINESS;
    default:
      return MembershipType.FREE;
  }
}

/**
 * Get workspace task limit for a membership type
 * @param membershipType - The membership type
 * @returns Number of workspace tasks allowed per day (Infinity for BUSINESS)
 */
export function getWorkspaceTaskLimit(membershipType: MembershipType): number {
  return WORKSPACE_TASK_LIMITS[membershipType];
}

/**
 * Check if can create a workspace task
 * @param tasksCreatedToday - Number of workspace tasks created today
 * @param membershipType - The membership type
 * @returns true if can create more workspace tasks, false if limit reached
 */
export function canCreateWorkspaceTask(tasksCreatedToday: number, membershipType: MembershipType): boolean {
  const limit = getWorkspaceTaskLimit(membershipType);
  
  // If unlimited (BUSINESS), always allow
  if (!isFinite(limit)) {
    return true;
  }
  
  return tasksCreatedToday < limit;
}

/**
 * Get remaining workspace tasks for today
 * @param tasksCreatedToday - Number of workspace tasks created today
 * @param membershipType - The membership type
 * @returns Number of remaining workspace tasks (or 'Unlimited' for BUSINESS)
 */
export function getRemainingWorkspaceTasks(tasksCreatedToday: number, membershipType: MembershipType): number | string {
  const limit = getWorkspaceTaskLimit(membershipType);
  
  if (!isFinite(limit)) {
    return 'Unlimited';
  }
  
  return Math.max(0, limit - tasksCreatedToday);
}

/**
 * Get membership description for workspace task
 * @param membershipType - The membership type
 * @returns Description with name and daily limit
 */
export function getWorkspaceTaskMembershipDescription(membershipType: MembershipType): { name: string; dailyLimit: number | string } {
  const key = membershipType.toLowerCase();
  return WORKSPACE_TASK_MEMBERSHIP_LEVEL_DESCRIPTIONS[key] || WORKSPACE_TASK_MEMBERSHIP_LEVEL_DESCRIPTIONS.free;
}

/**
 * Format workspace task limit error message
 * @param membershipType - The membership type
 * @param tasksCreatedToday - Number of workspace tasks created today
 * @returns Error message
 */
export function formatWorkspaceTaskLimitExceededMessage(membershipType: MembershipType, tasksCreatedToday: number = 0): string {
  const limit = getWorkspaceTaskLimit(membershipType);
  const description = getWorkspaceTaskMembershipDescription(membershipType);

  if (!isFinite(limit)) {
    return 'Unlimited workspace tasks allowed';
  }

  return `You have reached the daily workspace task limit of ${limit} tasks for ${description.name} membership. The workspace owner needs to upgrade their membership to create more tasks.`;
}

/**
 * Check workspace task limit for each membership tier
 * @param tasksCreatedToday - Number of workspace tasks created today
 * @param membershipLevel - Level from backend (0=BASIC, 1=PLUS, 2=BUSINESS) or undefined for FREE
 * @param hasActiveMembership - Whether owner has active membership
 * @returns Object with status for each tier
 */
export interface WorkspaceTaskLimitCheckResult {
  tier: MembershipType;
  dailyLimit: number | string;
  canCreate: boolean;
  remainingTasks: number | string;
  status: 'available' | 'limited' | 'unlimited';
}

export function checkWorkspaceTaskLimitForAllTiers(
  tasksCreatedToday: number,
  membershipLevel: number | string | undefined,
  hasActiveMembership: boolean
): Record<MembershipType, WorkspaceTaskLimitCheckResult> {
  const results: Record<MembershipType, WorkspaceTaskLimitCheckResult> = {} as Record<MembershipType, WorkspaceTaskLimitCheckResult>;

  // Check FREE tier (hasActiveMembership: false)
  const freeLimit = WORKSPACE_TASK_LIMITS[MembershipType.FREE];
  results[MembershipType.FREE] = {
    tier: MembershipType.FREE,
    dailyLimit: freeLimit,
    canCreate: tasksCreatedToday < freeLimit,
    remainingTasks: Math.max(0, freeLimit - tasksCreatedToday),
    status: tasksCreatedToday >= freeLimit ? 'limited' : 'available',
  };

  // Check BASIC tier (level: 0)
  const basicLimit = WORKSPACE_TASK_LIMITS[MembershipType.BASIC];
  results[MembershipType.BASIC] = {
    tier: MembershipType.BASIC,
    dailyLimit: basicLimit,
    canCreate: tasksCreatedToday < basicLimit,
    remainingTasks: Math.max(0, basicLimit - tasksCreatedToday),
    status: tasksCreatedToday >= basicLimit ? 'limited' : 'available',
  };

  // Check PLUS tier (level: 1)
  const plusLimit = WORKSPACE_TASK_LIMITS[MembershipType.PLUS];
  results[MembershipType.PLUS] = {
    tier: MembershipType.PLUS,
    dailyLimit: plusLimit,
    canCreate: tasksCreatedToday < plusLimit,
    remainingTasks: Math.max(0, plusLimit - tasksCreatedToday),
    status: tasksCreatedToday >= plusLimit ? 'limited' : 'available',
  };

  // Check BUSINESS tier (level: 2)
  const businessLimit = WORKSPACE_TASK_LIMITS[MembershipType.BUSINESS];
  results[MembershipType.BUSINESS] = {
    tier: MembershipType.BUSINESS,
    dailyLimit: isFinite(businessLimit) ? businessLimit : 'Unlimited',
    canCreate: true, // Always can create
    remainingTasks: 'Unlimited',
    status: 'unlimited',
  };

  return results;
}

/**
 * Get current owner's workspace task limit status
 * @param tasksCreatedToday - Number of workspace tasks created today
 * @param membershipLevel - Level from backend (0=BASIC, 1=PLUS, 2=BUSINESS) or undefined for FREE
 * @param hasActiveMembership - Whether owner has active membership
 * @returns Workspace task limit check result for current owner's tier
 */
export function getCurrentOwnerWorkspaceTaskLimitStatus(
  tasksCreatedToday: number,
  membershipLevel: number | string | undefined,
  hasActiveMembership: boolean
): WorkspaceTaskLimitCheckResult {
  const membershipType = getWorkspaceTaskMembershipType(membershipLevel || 0, hasActiveMembership);
  const allTiers = checkWorkspaceTaskLimitForAllTiers(tasksCreatedToday, membershipLevel, hasActiveMembership);
  return allTiers[membershipType];
}
