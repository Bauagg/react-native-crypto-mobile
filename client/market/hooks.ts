import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { useManualRefetch } from '../use-manual-refetch';
import { getRecommendations, getSymbols } from './api';
import type { Ticker } from './types';
import { useTickerSocket } from './use-ticker-socket';

export const marketKeys = {
  symbols: (search: string) => ['market', 'symbols', search] as const,
  recommendations: ['market', 'recommendations'] as const,
};

const SYMBOLS_POLL_FALLBACK_MS = 15000;
const RECOMMENDATIONS_POLL_MS = 60000;

/**
 * Daftar coin + harga real-time.
 * `liveEnabled`: true saat daftar tampil, supaya WebSocket hanya terbuka saat dibutuhkan.
 */
export function useSymbols({ search, liveEnabled }: { search: string; liveEnabled: boolean }) {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [liveTickers, setLiveTickers] = useState<Record<string, Ticker>>({});

  const query = useInfiniteQuery({
    queryKey: marketKeys.symbols(search),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getSymbols({ page: pageParam, search }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page, total_pages } = lastPage.meta;
      return page < total_pages ? page + 1 : undefined;
    },
    // Polling hanya jadi cadangan saat WebSocket tidak tersambung.
    refetchInterval: isSocketConnected ? false : SYMBOLS_POLL_FALLBACK_MS,
  });

  const symbols = useMemo(() => {
    const items = query.data?.pages.flatMap((page) => page.items) ?? [];
    return items.map((item) => {
      const live = liveTickers[item.symbol];
      return live
        ? { ...item, last_price: live.last_price, price_change_percent: live.price_change_percent }
        : item;
    });
  }, [query.data, liveTickers]);

  const handleTickers = useCallback((updates: Ticker[]) => {
    // Server hanya mengirim coin yang berubah, jadi gabungkan, jangan ganti seluruh isi.
    setLiveTickers((prev) => {
      const next = { ...prev };
      for (const ticker of updates) next[ticker.symbol] = ticker;
      return next;
    });
  }, []);

  const handleConnectedChange = useCallback((connected: boolean) => {
    setIsSocketConnected(connected);
    // Harga live yang lama dibuang saat putus supaya tidak menutupi data REST yang lebih baru.
    // Saat tersambung lagi, server mengirim harga terakhir semua coin.
    if (!connected) setLiveTickers({});
  }, []);

  useTickerSocket({
    symbols: useMemo(() => symbols.map((item) => item.symbol), [symbols]),
    enabled: liveEnabled,
    onTickers: handleTickers,
    onConnectedChange: handleConnectedChange,
  });

  const { refetch, isRefreshing } = useManualRefetch(query.refetch);

  return {
    symbols,
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

/** Harga live satu coin lewat WebSocket. null selama belum ada harga atau saat `enabled` false. */
export function useLiveTicker(symbol: string, enabled: boolean) {
  const [ticker, setTicker] = useState<Ticker | null>(null);

  const handleTickers = useCallback(
    (updates: Ticker[]) => {
      const match = updates.find((item) => item.symbol === symbol);
      if (match) setTicker(match);
    },
    [symbol]
  );

  const handleConnectedChange = useCallback((connected: boolean) => {
    if (!connected) setTicker(null);
  }, []);

  useTickerSocket({
    symbols: useMemo(() => (symbol ? [symbol] : []), [symbol]),
    enabled,
    onTickers: handleTickers,
    onConnectedChange: handleConnectedChange,
  });

  return enabled ? ticker : null;
}

/** Top pick harian + kondisi pasar. */
export function useRecommendations() {
  const query = useQuery({
    queryKey: marketKeys.recommendations,
    queryFn: getRecommendations,
    refetchInterval: RECOMMENDATIONS_POLL_MS,
  });

  const { refetch, isRefreshing } = useManualRefetch(query.refetch);

  return {
    data: query.data,
    recommendations: query.data?.recommendations ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
    isRefreshing,
  };
}
