import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { Ticker } from './types';

const MAX_SYMBOLS = 100;
const RECONNECT_DELAY_MS = 3000;

/** EXPO_PUBLIC_WS_URL (wss://host/api/) -> wss://host/api/market/ws/tickers */
function buildTickerUrl(symbols: string[]) {
  const base = (process.env.EXPO_PUBLIC_WS_URL ?? '').replace(/\/?$/, '/');
  return `${base}market/ws/tickers?symbols=${symbols.join(',')}`;
}

/**
 * Satu WebSocket untuk seluruh daftar coin yang tampil (bukan satu per coin).
 * - Tutup saat `enabled` false (pindah tab) atau app ke background, buka lagi saat kembali.
 * - Reconnect otomatis 3 detik setelah terputus.
 * - Daftar `symbols` yang berubah (scroll/search) dikirim lewat koneksi yang sama.
 */
export function useTickerSocket({
  symbols,
  enabled,
  onTickers,
  onConnectedChange,
}: {
  symbols: string[];
  enabled: boolean;
  onTickers: (tickers: Ticker[]) => void;
  onConnectedChange?: (connected: boolean) => void;
}) {
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');

  const symbolsRef = useRef<string[]>([]);
  const onTickersRef = useRef(onTickers);
  const onConnectedChangeRef = useRef(onConnectedChange);
  const socketRef = useRef<WebSocket | null>(null);

  const symbolsKey = symbols.slice(0, MAX_SYMBOLS).join(',');

  useEffect(() => {
    onTickersRef.current = onTickers;
    onConnectedChangeRef.current = onConnectedChange;
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setIsAppActive(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  // Kirim daftar coin terbaru lewat koneksi yang sama (menggantikan daftar sebelumnya).
  useEffect(() => {
    symbolsRef.current = symbolsKey ? symbolsKey.split(',') : [];
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ symbols: symbolsRef.current }));
    }
  }, [symbolsKey]);

  const shouldConnect = enabled && isAppActive && symbolsKey.length > 0;

  useEffect(() => {
    if (!shouldConnect) return;

    let closedByUs = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      const socket = new WebSocket(buildTickerUrl(symbolsRef.current));
      socketRef.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({ symbols: symbolsRef.current }));
        onConnectedChangeRef.current?.(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) onTickersRef.current(data as Ticker[]);
        } catch {
          // abaikan pesan yang bukan JSON
        }
      };

      socket.onerror = () => socket.close();

      socket.onclose = () => {
        if (socketRef.current === socket) socketRef.current = null;
        onConnectedChangeRef.current?.(false);
        if (!closedByUs) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      closedByUs = true;
      clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, [shouldConnect]);
}
