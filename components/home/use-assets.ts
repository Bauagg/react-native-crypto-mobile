import { useCallback, useMemo, useState } from 'react';

import type { Ticker } from '@/client/market/types';
import { useTickerSocket } from '@/client/market/use-ticker-socket';
import { useOpenPositions } from '@/client/transactions/hooks';
import type { AccountMode, Position } from '@/client/transactions/types';

export interface PositionView extends Position {
  /** Harga terakhir dari WebSocket, null kalau belum ada. */
  currentPrice: number | null;
  currentValue: number;
  pnlValue: number;
  pnlPct: number;
}

export interface AssetSummary {
  count: number;
  invested: number;
  value: number;
  pnl: number;
  pnlPct: number;
}

function toNumber(raw: string | null | undefined) {
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Posisi OPEN milik user untuk mode akun tertentu (DEMO / LIVE).
 * Harga kini dan untung/rugi mengikuti harga live (WebSocket); kalau belum ada harga,
 * dipakai nilai dari BE.
 */
export function useAssets({ mode }: { mode: AccountMode }) {
  const query = useOpenPositions(mode);
  const rawPositions = query.positions;

  const [liveTickers, setLiveTickers] = useState<Record<string, Ticker>>({});

  const handleTickers = useCallback((updates: Ticker[]) => {
    // Server hanya mengirim coin yang berubah, jadi gabungkan, jangan ganti seluruh isi.
    setLiveTickers((prev) => {
      const next = { ...prev };
      for (const ticker of updates) next[ticker.symbol] = ticker;
      return next;
    });
  }, []);

  const handleConnectedChange = useCallback((connected: boolean) => {
    // Harga lama dibuang saat putus; saat tersambung lagi server mengirim harga terakhir semua coin.
    if (!connected) setLiveTickers({});
  }, []);

  const symbols = useMemo(
    () => Array.from(new Set((rawPositions ?? []).map((position) => position.symbol))),
    [rawPositions]
  );

  useTickerSocket({
    symbols,
    enabled: true,
    onTickers: handleTickers,
    onConnectedChange: handleConnectedChange,
  });

  const positions = useMemo<PositionView[]>(
    () =>
      (rawPositions ?? []).map((position) => {
        const quantity = toNumber(position.quantity);
        const entryValue = toNumber(position.entry_value);
        const livePrice = liveTickers[position.symbol]
          ? Number(liveTickers[position.symbol].last_price)
          : NaN;

        if (Number.isFinite(livePrice)) {
          const currentValue = quantity * livePrice;
          const pnlValue = currentValue - entryValue;
          return {
            ...position,
            currentPrice: livePrice,
            currentValue,
            pnlValue,
            pnlPct: entryValue > 0 ? (pnlValue / entryValue) * 100 : 0,
          };
        }

        const pnlValue = toNumber(position.pnl_amount);
        return {
          ...position,
          currentPrice: null,
          currentValue: entryValue + pnlValue,
          pnlValue,
          pnlPct: toNumber(position.pnl_percent),
        };
      }),
    [rawPositions, liveTickers]
  );

  const summary = useMemo<AssetSummary>(() => {
    const invested = positions.reduce((sum, p) => sum + toNumber(p.entry_value), 0);
    const value = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const pnl = value - invested;
    return {
      count: positions.length,
      invested,
      value,
      pnl,
      pnlPct: invested > 0 ? (pnl / invested) * 100 : 0,
    };
  }, [positions]);

  return {
    positions,
    summary,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefreshing: query.isRefreshing,
  };
}
