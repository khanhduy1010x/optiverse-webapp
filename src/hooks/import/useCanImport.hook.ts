import { useAppSelector } from '../../store/hooks';

/**
 * Hook to check if user can use import feature based on membership level
 * Mapping from req.userInfo.membership:
 * - hasActiveMembership: false → FREE (cannot import)
 * - hasActiveMembership: true + level: 0 → BASIC (can import)
 * - hasActiveMembership: true + level: 1 → PLUS (can import)
 * - hasActiveMembership: true + level: 2 → BUSINESS (can import)
 */
export const useCanImport = () => {
  const user = useAppSelector((state) => state.auth.user);
  const membershipLevel = user?.membership?.level ?? 0;
  const hasActiveMembership = user?.membership?.hasActiveMembership ?? false;

  // Only users with active membership can import
  // FREE plan (hasActiveMembership: false) cannot import
  const canImport = hasActiveMembership;
  const needsUpgrade = !hasActiveMembership;

  return {
    canImport,
    membershipLevel,
    hasActiveMembership,
    needsUpgrade,
  };
};
