import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { DashboardSummary } from '@/client/transactions/types';
import { palette } from '@/components/home/palette';

import {
  EMPTY,
  formatMoney,
  formatPercent,
  formatSignedMoney,
  toNumber,
  type MoneyContext,
} from './format';

export function SummaryHero({
  summary,
  money,
  currencyToggle,
}: {
  summary: DashboardSummary;
  money: MoneyContext;
  currencyToggle?: React.ReactNode;
}) {
  const returnAmount = toNumber(summary.total_return_amount);
  const isUp = (returnAmount ?? 0) >= 0;
  const tone = returnAmount === null ? palette.subtle : isUp ? palette.up : palette.down;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>Total nilai portofolio</Text>
        {currencyToggle}
      </View>

      <Text style={styles.total} numberOfLines={1} adjustsFontSizeToFit>
        {formatMoney(summary.total_value, money)}
      </Text>

      <View style={styles.returnRow}>
        {returnAmount !== null ? (
          <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={14} color={tone} />
        ) : null}
        <Text style={[styles.returnText, { color: tone }]}>
          {formatSignedMoney(summary.total_return_amount, money)} (
          {formatPercent(summary.total_return_percent, true)})
        </Text>
        <Text style={styles.returnHint}>sejak modal awal</Text>
      </View>

      <View style={styles.statsRow}>
        <Mini label="Saldo bebas" value={formatMoney(summary.cash, money)} />
        <Mini label="Nilai coin" value={formatMoney(summary.open_value, money)} />
        <Mini
          label="Modal awal"
          value={summary.initial_capital === null ? EMPTY : formatMoney(summary.initial_capital, money)}
        />
      </View>
    </View>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.mini}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: palette.subtle,
  },
  total: {
    fontSize: 34,
    fontWeight: '800',
    color: palette.ink,
  },
  returnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  returnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  returnHint: {
    fontSize: 11,
    color: palette.subtle,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  mini: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 2,
  },
  miniLabel: {
    fontSize: 10,
    color: palette.subtle,
  },
  miniValue: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.ink,
  },
});
