import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DashboardSummary } from '@/client/transactions/types';
import { getBaseAsset } from '@/components/home/format-price';
import { palette } from '@/components/home/palette';

import {
  formatDay,
  formatMonth,
  formatPercent,
  formatSignedMoney,
  toNumber,
  type MoneyContext,
} from './format';
import { SectionCard } from './section-card';

export function Highlights({
  summary,
  money,
}: {
  summary: DashboardSummary;
  money: MoneyContext;
}) {
  const { best_trade, worst_trade, best_month, worst_month } = summary;
  if (!best_trade && !worst_trade && !best_month && !worst_month) return null;

  return (
    <SectionCard title="Sorotan" subtitle="Hasil terbaik dan terburuk">
      <View style={styles.grid}>
        {best_trade ? (
          <Tile
            label="Trade terbaik"
            title={getBaseAsset(best_trade.symbol)}
            value={formatSignedMoney(best_trade.pnl_amount, money)}
            hint={`${formatPercent(best_trade.pnl_percent, true)} · ${formatDay(best_trade.closed_at)}`}
            amount={best_trade.pnl_amount}
            onPress={() => openTransaction(best_trade.id)}
          />
        ) : null}
        {worst_trade ? (
          <Tile
            label="Trade terburuk"
            title={getBaseAsset(worst_trade.symbol)}
            value={formatSignedMoney(worst_trade.pnl_amount, money)}
            hint={`${formatPercent(worst_trade.pnl_percent, true)} · ${formatDay(worst_trade.closed_at)}`}
            amount={worst_trade.pnl_amount}
            onPress={() => openTransaction(worst_trade.id)}
          />
        ) : null}
        {best_month ? (
          <Tile
            label="Bulan terbaik"
            title={formatMonth(best_month.month)}
            value={formatSignedMoney(best_month.pnl, money)}
            hint={`${best_month.wins} dari ${best_month.trades} trade untung`}
            amount={best_month.pnl}
          />
        ) : null}
        {worst_month ? (
          <Tile
            label="Bulan terburuk"
            title={formatMonth(worst_month.month)}
            value={formatSignedMoney(worst_month.pnl, money)}
            hint={`${worst_month.wins} dari ${worst_month.trades} trade untung`}
            amount={worst_month.pnl}
          />
        ) : null}
      </View>
    </SectionCard>
  );
}

function openTransaction(id: string) {
  router.push({ pathname: '/transaction/[id]', params: { id } });
}

function Tile({
  label,
  title,
  value,
  hint,
  amount,
  onPress,
}: {
  label: string;
  title: string;
  value: string;
  hint: string;
  amount: string;
  /** Kalau diisi, tile bisa diketuk (trade punya detail; bulan tidak). */
  onPress?: () => void;
}) {
  const number = toNumber(amount) ?? 0;
  const tone = number > 0 ? palette.up : number < 0 ? palette.down : palette.ink;

  return (
    <Pressable style={styles.tile} onPress={onPress} disabled={!onPress}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.value, { color: tone }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.hint} numberOfLines={1}>
        {hint}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  label: {
    fontSize: 10,
    color: palette.subtle,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.ink,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
  },
  hint: {
    fontSize: 10,
    color: palette.subtle,
  },
});
