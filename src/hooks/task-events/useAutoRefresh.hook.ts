import { useState, useEffect, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval?: number;
  enabled?: boolean;
}

export const useAutoRefresh = (
  refreshCallback: () => void,
  options: UseAutoRefreshOptions = {}
) => {
  const { interval = 30000, enabled = true } = options;
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Auto refresh on interval
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      console.log('Auto-refreshing triggered');
      setRefreshTrigger(prev => prev + 1);
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval, enabled]);

  // Call refresh callback when trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Refresh triggered by timer');
      refreshCallback();
    }
  }, [refreshTrigger, refreshCallback]);

  // Manual refresh trigger
  const triggerRefresh = useCallback(() => {
    console.log('Manual refresh triggered');
    refreshCallback();
  }, [refreshCallback]);

  return {
    triggerRefresh,
    refreshCount: refreshTrigger
  };
}; 