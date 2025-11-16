import { useState, useEffect, useCallback } from 'react';
import { DashboardStats } from '../../types/membership-stats.type';
import membershipStatsService from '../../services/membership-stats.service';
import { toast } from 'react-toastify';

export const useMembershipStats = (initialPeriod: string = '30d') => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>(initialPeriod);

  const fetchStats = useCallback(async (selectedPeriod: string = period) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await membershipStatsService.getDashboardStats(selectedPeriod);
      setStats(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to load statistics';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching membership stats:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  const changePeriod = useCallback((newPeriod: string) => {
    setPeriod(newPeriod);
    fetchStats(newPeriod);
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchStats(period);
  }, [fetchStats, period]);

  useEffect(() => {
    fetchStats(period);
  }, []); // Only fetch on mount

  return {
    stats,
    loading,
    error,
    period,
    changePeriod,
    refetch,
  };
};

export default useMembershipStats;
