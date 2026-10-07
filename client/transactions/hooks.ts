import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useManualRefetch } from '../use-manual-refetch';
import { getClosedTransactions, getDashboard, getOpenPositions, getTransaction } from './api';
import type { AccountMode, DashboardQuery, HistoryQuery } from './types';

export const transactionKeys = {
  detail: (id: string) => ['transactions', 'detail', id] as const,
  dashboard: (query: DashboardQuery) =>
    ['transactions', 'dashboard', query.mode, query.source, query.period] as const,
  open: (mode: AccountMode) => ['transactions', 'open', mode] as const,
  history: (filters: HistoryQuery) =>
    ['transactions', 'history', filters.mode, filters.search, filters.result, filters.sort] as const,
};

const POLL_INTERVAL_MS = 30000;
const HISTORY_POLL_INTERVAL_MS = 60000;

/** Detail satu transaksi. Posisi OPEN diperbarui pelan-pelan, posisi CLOSED sudah final. */
export function useTransaction(id: string) {
  const query = useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransaction(id),
    enabled: id.length > 0,
    refetchInterval: (q) => (q.state.data?.status === 'OPEN' ? POLL_INTERVAL_MS : false),
  });

  const { refetch, isRefreshing } = useManualRefetch(query.refetch);

  return {
    transaction: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
    isRefreshing,
  };
}

/** Dasbor performa trading. Tidak perlu polling cepat: cukup saat dibuka, tarik-refresh, atau ganti filter. */
export function useDashboard(filters: DashboardQuery) {
  const query = useQuery({
    queryKey: transactionKeys.dashboard(filters),
    queryFn: () => getDashboard(filters),
  });

  const { refetch, isRefreshing } = useManualRefetch(query.refetch);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
    isRefreshing,
  };
}

/** Posisi OPEN milik user untuk mode akun DEMO / LIVE. */
export function useOpenPositions(mode: AccountMode) {
  const query = useQuery({
    queryKey: transactionKeys.open(mode),
    queryFn: () => getOpenPositions(mode),
    // Daftar posisi jarang berubah, cukup diperbarui pelan-pelan di background tanpa spinner.
    refetchInterval: POLL_INTERVAL_MS,
  });

  const { refetch, isRefreshing } = useManualRefetch(query.refetch);

  return {
    positions: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
    isRefreshing,
  };
}

/** Riwayat posisi CLOSED milik user untuk mode akun DEMO / LIVE (infinite scroll). */
export function useClosedTransactions(filters: HistoryQuery) {
  const { mode, search, result, sort } = filters;

  const query = useInfiniteQuery({
    queryKey: transactionKeys.history(filters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getClosedTransactions({ mode, search, result, sort, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page, total_pages } = lastPage.meta;
      return page < total_pages ? page + 1 : undefined;
    },
    // Riwayat jarang berubah, cukup diperbarui pelan-pelan di background tanpa spinner.
    refetchInterval: HISTORY_POLL_INTERVAL_MS,
  });

  const transactions = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  const { refetch, isRefreshing } = useManualRefetch(query.refetch);

  return {
    transactions,
    total: query.data?.pages[0]?.meta?.total,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
    isRefreshing,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
