import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLiveTicker } from '@/client/market/hooks';
import { useTransaction } from '@/client/transactions/hooks';
import { toNumber, type Currency, type MoneyContext } from '@/components/dashboard/format';
import { ErrorState, getErrorStateVariant } from '@/components/global/error-state';
import { ScreenHeader } from '@/components/global/screen-header';
import { SegmentedControl } from '@/components/global/segmented-control';
import { palette } from '@/components/home/palette';
import { OrderProof } from '@/components/transaction-detail/order-proof';
import { TradeSections } from '@/components/transaction-detail/trade-sections';
import { TransactionHero, type LivePnl } from '@/components/transaction-detail/transaction-hero';

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'USDT', label: 'USDT' },
  { value: 'IDR', label: 'IDR' },
];

export default function TransactionDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currencyChoice, setCurrencyChoice] = useState<Currency | null>(null);

  const { transaction: tx, isLoading, isError, error, refetch, isRefreshing } = useTransaction(
    id ?? ''
  );

  // Harga live hanya untuk posisi yang masih dipegang; posisi CLOSED nilainya sudah final.
  const isOpen = tx?.status === 'OPEN';
  const ticker = useLiveTicker(tx?.symbol ?? '', isOpen);
  const parsedPrice = ticker ? Number(ticker.last_price) : NaN;
  const livePrice = Number.isFinite(parsedPrice) ? parsedPrice : null;

  const livePnl = useMemo<LivePnl | null>(() => {
    if (!tx || !isOpen || livePrice === null) return null;
    const entryValue = toNumber(tx.entry_value) ?? 0;
    const value = (toNumber(tx.quantity) ?? 0) * livePrice - entryValue;
    return { value, percent: entryValue > 0 ? (value / entryValue) * 100 : 0 };
  }, [tx, isOpen, livePrice]);

  const rate = toNumber(tx?.usdt_idr_rate);
  // Pilihan user menang; kalau belum memilih pakai mata uang saat posisi dibuka. Tanpa kurs = USDT.
  const currency: Currency =
    rate === null ? 'USDT' : (currencyChoice ?? (tx?.currency === 'IDR' ? 'IDR' : 'USDT'));
  const money = useMemo<MoneyContext>(() => ({ currency, rate }), [currency, rate]);

  const errorStatus = (error as (Error & { status?: number }) | null)?.status;

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title="Detail Transaksi"
        subtitle={tx ? `${tx.account_mode === 'LIVE' ? 'Akun live' : 'Akun demo'}` : undefined}
        icon="receipt-outline"
        onBack={() => router.back()}
      />

      {isError && !tx ? (
        <ErrorState
          variant={getErrorStateVariant(
            errorStatus,
            error instanceof Error && error.message === 'Network Error'
          )}
          title={errorStatus === 404 ? 'Transaksi Tidak Ditemukan' : undefined}
          message={
            errorStatus === 404
              ? 'Posisi ini tidak ada atau bukan milik akunmu.'
              : undefined
          }
          onRetry={errorStatus === 404 ? undefined : () => refetch()}
        />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={palette.accent} />
          }>
          {isLoading || !tx ? (
            <>
              <View style={[styles.skeleton, { height: 210 }]} />
              <View style={[styles.skeleton, { height: 190 }]} />
              <View style={[styles.skeleton, { height: 150 }]} />
            </>
          ) : (
            <>
              <TransactionHero
                tx={tx}
                money={money}
                livePnl={livePnl}
                currencyToggle={
                  rate !== null ? (
                    <SegmentedControl
                      options={CURRENCY_OPTIONS}
                      value={currency}
                      onChange={setCurrencyChoice}
                    />
                  ) : undefined
                }
              />
              <TradeSections tx={tx} money={money} livePrice={livePrice} />
              <OrderProof tx={tx} />
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  skeleton: {
    backgroundColor: palette.border,
    borderRadius: 16,
    opacity: 0.6,
  },
});
