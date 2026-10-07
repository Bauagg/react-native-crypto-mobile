import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useRecommendations, useSymbols } from '@/client/market/hooks';
import { createApiError } from '@/client/unwrap';
import { AuthService } from '@/utils/auth/AuthService';

const SEARCH_DEBOUNCE_MS = 350;

/** `liveEnabled`: true saat tab All Coin tampil, supaya WebSocket harga hanya terbuka saat dibutuhkan. */
export function useHome({ liveEnabled }: { liveEnabled: boolean }) {
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await AuthService.getCurrentUser();
      if (!res.success || !res.data) {
        throw createApiError(res.message ?? 'Gagal mengambil profil', res.status);
      }
      return res.data;
    },
  });

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const symbols = useSymbols({ search: debouncedQuery, liveEnabled });
  const recommendations = useRecommendations();

  return {
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,

    query,
    setQuery,

    symbols: symbols.symbols,
    total: symbols.total,
    isSymbolsLoading: symbols.isLoading,
    isSymbolsError: symbols.isError,
    symbolsError: symbols.error,
    refetchSymbols: symbols.refetch,
    isRefreshingSymbols: symbols.isRefreshing,

    fetchNextPage: symbols.fetchNextPage,
    hasNextPage: symbols.hasNextPage,
    isFetchingNextPage: symbols.isFetchingNextPage,

    recommendationsData: recommendations.data,
    recommendations: recommendations.recommendations,
    isRecommendationsLoading: recommendations.isLoading,
    isRecommendationsError: recommendations.isError,
    recommendationsError: recommendations.error,
    refetchRecommendations: recommendations.refetch,
    isRefreshingRecommendations: recommendations.isRefreshing,
  };
}
