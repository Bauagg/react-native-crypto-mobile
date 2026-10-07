import { useCallback, useState } from 'react';

/**
 * Spinner tarik-refresh hanya untuk refresh manual user. Polling otomatis di background
 * (refetchInterval) tidak boleh memunculkan spinner, jadi jangan pakai `isRefetching`.
 */
export function useManualRefetch(refetch: () => Promise<unknown>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const manualRefetch = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return { refetch: manualRefetch, isRefreshing };
}
