import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDashboard } from '@/client/transactions/hooks';
import type {
  AccountMode,
  DashboardData,
  DashboardPeriod,
  DashboardSource,
} from '@/client/transactions/types';
import { AuthGuard } from '@/components/auth-guard';
import { AllocationDonut } from '@/components/dashboard/allocation-donut';
import { AssetStats } from '@/components/dashboard/asset-stats';
import { EquityChart, type EquityChartPoint } from '@/components/dashboard/equity-chart';
import { formatMoney, toNumber, type Currency, type MoneyContext } from '@/components/dashboard/format';
import { Highlights } from '@/components/dashboard/highlights';
import { MonthlyChart } from '@/components/dashboard/monthly-chart';
import { SectionCard } from '@/components/dashboard/section-card';
import { StatGrid } from '@/components/dashboard/stat-grid';
import { SummaryHero } from '@/components/dashboard/summary-hero';
import { ErrorState, getErrorStateVariant } from '@/components/global/error-state';
import { ModeSwitch } from '@/components/global/mode-switch';
import { ScreenHeader } from '@/components/global/screen-header';
import { SegmentedControl } from '@/components/global/segmented-control';
import { SelectDropdown } from '@/components/global/select-dropdown';
import { palette } from '@/components/home/palette';

const SOURCE_OPTIONS: { value: DashboardSource; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'BOT', label: 'Robot' },
  { value: 'MANUAL', label: 'Manual' },
];

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'ALL', label: 'Semua waktu' },
  { value: '30D', label: '30 hari terakhir' },
  { value: '3M', label: '3 bulan terakhir' },
  { value: 'YTD', label: 'Tahun ini' },
];

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'USDT', label: 'USDT' },
  { value: 'IDR', label: 'IDR' },
];

export default function DashboardScreen() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

/** Titik grafik modal; kalau modal awal tidak diketahui, pakai untung/rugi kumulatif. */
function buildEquityPoints(data: DashboardData) {
  const hasEquity = data.equity.length > 0 && data.equity.every((point) => point.equity !== null);

  const points: EquityChartPoint[] = data.equity.map((point) => ({
    date: point.date,
    value: toNumber(hasEquity ? point.equity : point.cumulative_pnl) ?? 0,
    pnl: toNumber(point.cumulative_pnl),
  }));

  // Titik "hari ini" dari nilai portofolio sekarang, supaya grafik tidak berhenti di trade terakhir.
  const totalValue = toNumber(data.summary.total_value);
  const today = new Date().toISOString().slice(0, 10);
  if (hasEquity && totalValue !== null && points[points.length - 1].date < today) {
    points.push({ date: today, value: totalValue, pnl: toNumber(data.summary.total_return_amount) });
  }

  return { points, valueLabel: hasEquity ? 'modal' : 'untung/rugi kumulatif' };
}

function DashboardContent() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AccountMode>('DEMO');
  const [source, setSource] = useState<DashboardSource>('ALL');
  const [period, setPeriod] = useState<DashboardPeriod>('ALL');
  const [currencyChoice, setCurrencyChoice] = useState<Currency | null>(null);

  const { data, isLoading, isError, error, refetch, isRefreshing } = useDashboard({
    mode,
    source,
    period,
  });

  const rate = toNumber(data?.usdt_idr_rate);
  // Pilihan user menang; kalau belum memilih pakai preferred_currency dari BE. Tanpa kurs = USDT.
  const currency: Currency = rate === null ? 'USDT' : (currencyChoice ?? data?.preferred_currency ?? 'USDT');
  const money = useMemo<MoneyContext>(() => ({ currency, rate }), [currency, rate]);

  const equity = useMemo(() => (data ? buildEquityPoints(data) : null), [data]);

  const hasActivity = data ? data.summary.closed_trades > 0 || data.summary.open_positions > 0 : false;

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Dasbor" subtitle="Performa trading kamu" icon="stats-chart-outline" />

      <View style={styles.controls}>
        <ModeSwitch value={mode} onChange={setMode} />
        <View style={styles.dropdownRow}>
          <SelectDropdown
            label="Sumber"
            icon="hardware-chip-outline"
            value={source}
            options={SOURCE_OPTIONS}
            onChange={setSource}
          />
          <SelectDropdown
            label="Periode"
            icon="calendar-outline"
            value={period}
            options={PERIOD_OPTIONS}
            onChange={setPeriod}
          />
        </View>
      </View>

      {isError && !data ? (
        <ErrorState
          variant={getErrorStateVariant(
            (error as (Error & { status?: number }) | null)?.status,
            error instanceof Error && error.message === 'Network Error'
          )}
          onRetry={() => refetch()}
        />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={palette.accent} />
          }>
          {isLoading || !data || !equity ? (
            <>
              <View style={[styles.skeleton, { height: 170 }]} />
              <View style={[styles.skeleton, { height: 260 }]} />
              <View style={[styles.skeleton, { height: 260 }]} />
            </>
          ) : (
            <>
              <SummaryHero
                summary={data.summary}
                money={money}
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

              {hasActivity ? (
                <>
                  <StatGrid summary={data.summary} money={money} />

                  <SectionCard
                    title="Pertumbuhan Modal"
                    subtitle="Sentuh grafik untuk melihat nilai tiap hari">
                    {equity.points.length > 0 ? (
                      <EquityChart points={equity.points} money={money} valueLabel={equity.valueLabel} />
                    ) : (
                      <NoData text="Belum ada trade yang ditutup pada filter ini." />
                    )}
                  </SectionCard>

                  <SectionCard title="Untung/Rugi per Bulan" subtitle="Sentuh batang untuk melihat rincian">
                    {data.monthly.length > 0 ? (
                      <MonthlyChart months={data.monthly} money={money} />
                    ) : (
                      <NoData text="Belum ada trade yang ditutup pada filter ini." />
                    )}
                  </SectionCard>

                  {data.allocation.length > 0 ? (
                    <SectionCard title="Isi Portofolio" subtitle="Komposisi nilai sekarang">
                      <AllocationDonut
                        allocation={data.allocation}
                        centerLabel="Total"
                        centerValue={formatMoney(data.summary.total_value, money)}
                        money={money}
                      />
                    </SectionCard>
                  ) : null}

                  <Highlights summary={data.summary} money={money} />
                  <AssetStats assets={data.per_asset} money={money} />
                </>
              ) : (
                <View style={styles.empty}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="stats-chart-outline" size={28} color={palette.accent} />
                  </View>
                  <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
                  <Text style={styles.emptyText}>
                    Statistik, grafik, dan komposisi portofolio akan tampil di sini setelah ada
                    transaksi {mode === 'DEMO' ? 'demo' : 'live'}.
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function NoData({ text }: { text: string }) {
  return <Text style={styles.noData}>{text}</Text>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  controls: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 12,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  skeleton: {
    backgroundColor: palette.border,
    borderRadius: 16,
    opacity: 0.6,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: palette.subtle,
    textAlign: 'center',
  },
  noData: {
    fontSize: 12,
    color: palette.subtle,
    paddingVertical: 12,
  },
});
