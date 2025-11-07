/**
 * Task Limit Utility - Frontend
 * Sync với backend: a:\Study\SEM9\SEP\Optivers\full-app\productivity-service\src\tasks\utils\task-limit.util.ts
 * 
 * Membership Levels:
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

export const TASK_LIMITS: Record<MembershipType, number> = {
  [MembershipType.FREE]: 10,
  [MembershipType.BASIC]: 20,
  [MembershipType.PLUS]: 50,
  [MembershipType.BUSINESS]: Infinity, // Unlimited
};

export const MEMBERSHIP_LEVEL_DESCRIPTIONS: Record<string, { name: string; dailyLimit: number | string }> = {
  free: { name: 'FREE', dailyLimit: 10 },
  basic: { name: 'BASIC', dailyLimit: 20 },
  plus: { name: 'PLUS', dailyLimit: 50 },
  business: { name: 'BUSINESS', dailyLimit: 'Unlimited' },
};

/**
 * Get membership type based on level and active status
 * 
 * Logic:
 * - Nếu hasActiveMembership: false → FREE (bất kể level)
 * - Nếu hasActiveMembership: true:
 *   - level 0 → BASIC
 *   - level 1 → PLUS
 *   - level 2 → BUSINESS
 *   - level khác → FREE (invalid level được coi là FREE)
 * 
 * @param membershipLevel - Level from backend (0=BASIC, 1=PLUS, 2=BUSINESS)
 * @param hasActiveMembership - Whether user has active membership
 * @returns MembershipType enum value
 */
export function getMembershipType(
  membershipLevel: number | string,
  hasActiveMembership: boolean
): MembershipType {
  // Priority 1: Nếu hasActiveMembership false, luôn là FREE
  if (!hasActiveMembership) {
    console.log('[getMembershipType] hasActiveMembership: false → FREE');
    return MembershipType.FREE;
  }

  // Priority 2: Khi hasActiveMembership true, kiểm tra level
  // Convert to number if string
  const level = typeof membershipLevel === 'string' ? parseInt(membershipLevel, 10) : membershipLevel;

  // Validate level là integer và trong range [0, 2]
  if (!Number.isInteger(level) || level < 0 || level > 2) {
    console.log(`[getMembershipType] hasActiveMembership: true nhưng level ${level} không hợp lệ → FREE`);
    return MembershipType.FREE;
  }

  switch (level) {
    case 0:
      console.log('[getMembershipType] hasActiveMembership: true + level 0 → BASIC');
      return MembershipType.BASIC;
    case 1:
      console.log('[getMembershipType] hasActiveMembership: true + level 1 → PLUS');
      return MembershipType.PLUS;
    case 2:
      console.log('[getMembershipType] hasActiveMembership: true + level 2 → BUSINESS');
      return MembershipType.BUSINESS;
    default:
      console.log(`[getMembershipType] Default case for level ${level} → FREE`);
      return MembershipType.FREE;
  }
}

/**
 * Get task limit for a membership type
 * @param membershipType - The membership type
 * @returns Number of tasks allowed per day (Infinity for BUSINESS)
 */
export function getTaskLimit(membershipType: MembershipType): number {
  return TASK_LIMITS[membershipType];
}

/**
 * Check if user can create a task
 * @param tasksCreatedToday - Number of tasks created today
 * @param membershipType - The membership type
 * @returns true if user can create more tasks, false if limit reached
 */
export function canCreateTask(tasksCreatedToday: number, membershipType: MembershipType): boolean {
  const limit = getTaskLimit(membershipType);
  
  // If unlimited (BUSINESS), always allow
  if (!isFinite(limit)) {
    return true;
  }
  
  return tasksCreatedToday < limit;
}

/**
 * Get remaining tasks for today
 * @param tasksCreatedToday - Number of tasks created today
 * @param membershipType - The membership type
 * @returns Number of remaining tasks (or 'Unlimited' for BUSINESS)
 */
export function getRemainingTasks(tasksCreatedToday: number, membershipType: MembershipType): number | string {
  const limit = getTaskLimit(membershipType);
  
  if (!isFinite(limit)) {
    return 'Unlimited';
  }
  
  return Math.max(0, limit - tasksCreatedToday);
}

/**
 * Get membership description
 * @param membershipType - The membership type
 * @returns Description with name and daily limit
 */
export function getMembershipDescription(membershipType: MembershipType): { name: string; dailyLimit: number | string } {
  const key = membershipType.toLowerCase();
  return MEMBERSHIP_LEVEL_DESCRIPTIONS[key] || MEMBERSHIP_LEVEL_DESCRIPTIONS.free;
}

/**
 * Format task limit error message
 * @param membershipType - The membership type
 * @param tasksCreatedToday - Number of tasks created today
 * @returns Error message
 */
export function formatTaskLimitExceededMessage(membershipType: MembershipType, tasksCreatedToday: number = 0): string {
  const limit = getTaskLimit(membershipType);
  const description = getMembershipDescription(membershipType);

  if (!isFinite(limit)) {
    return 'Unlimited tasks allowed';
  }

  return `You have reached the daily task limit of ${limit} tasks for ${description.name} membership. Please upgrade your membership to create more tasks.`;
}

/**
 * Check task limit for each membership tier
 * @param tasksCreatedToday - Number of tasks created today
 * @param membershipLevel - Level from backend (0=BASIC, 1=PLUS, 2=BUSINESS) or undefined for FREE
 * @param hasActiveMembership - Whether user has active membership
 * @returns Object with status for each tier
 */
export interface TaskLimitCheckResult {
  tier: MembershipType;
  dailyLimit: number | string;
  canCreate: boolean;
  remainingTasks: number | string;
  status: 'available' | 'limited' | 'unlimited';
}

export function checkTaskLimitForAllTiers(
  tasksCreatedToday: number,
  membershipLevel: number | string | undefined,
  hasActiveMembership: boolean
): Record<MembershipType, TaskLimitCheckResult> {
  const results: Record<MembershipType, TaskLimitCheckResult> = {} as Record<MembershipType, TaskLimitCheckResult>;

  // Check FREE tier (hasActiveMembership: false)
  const freeLimit = TASK_LIMITS[MembershipType.FREE];
  results[MembershipType.FREE] = {
    tier: MembershipType.FREE,
    dailyLimit: freeLimit,
    canCreate: tasksCreatedToday < freeLimit,
    remainingTasks: Math.max(0, freeLimit - tasksCreatedToday),
    status: tasksCreatedToday >= freeLimit ? 'limited' : 'available',
  };

  // Check BASIC tier (level: 0)
  const basicLimit = TASK_LIMITS[MembershipType.BASIC];
  results[MembershipType.BASIC] = {
    tier: MembershipType.BASIC,
    dailyLimit: basicLimit,
    canCreate: tasksCreatedToday < basicLimit,
    remainingTasks: Math.max(0, basicLimit - tasksCreatedToday),
    status: tasksCreatedToday >= basicLimit ? 'limited' : 'available',
  };

  // Check PLUS tier (level: 1)
  const plusLimit = TASK_LIMITS[MembershipType.PLUS];
  results[MembershipType.PLUS] = {
    tier: MembershipType.PLUS,
    dailyLimit: plusLimit,
    canCreate: tasksCreatedToday < plusLimit,
    remainingTasks: Math.max(0, plusLimit - tasksCreatedToday),
    status: tasksCreatedToday >= plusLimit ? 'limited' : 'available',
  };

  // Check BUSINESS tier (level: 2)
  const businessLimit = TASK_LIMITS[MembershipType.BUSINESS];
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
 * Get current user's task limit status
 * @param tasksCreatedToday - Number of tasks created today
 * @param membershipLevel - Level from backend (0=BASIC, 1=PLUS, 2=BUSINESS) or undefined for FREE
 * @param hasActiveMembership - Whether user has active membership
 * @returns Task limit check result for current user's tier
 */
export function getCurrentUserTaskLimitStatus(
  tasksCreatedToday: number,
  membershipLevel: number | string | undefined,
  hasActiveMembership: boolean
): TaskLimitCheckResult {
  const membershipType = getMembershipType(membershipLevel || 0, hasActiveMembership);
  const allTiers = checkTaskLimitForAllTiers(tasksCreatedToday, membershipLevel, hasActiveMembership);
  return allTiers[membershipType];
}
