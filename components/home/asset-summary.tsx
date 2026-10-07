import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { formatAmount, formatSignedAmount, formatSignedPercent } from './format-asset';
import { palette } from './palette';
import type { AssetSummary } from './use-assets';

export function AssetSummaryCard({ summary }: { summary: AssetSummary }) {
  const isUp = summary.pnl >= 0;
  const tone = isUp ? palette.up : palette.down;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Total nilai aset</Text>
      <Text style={styles.total}>${formatAmount(summary.value)}</Text>

      <View style={styles.pnlRow}>
        <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={14} color={tone} />
        <Text style={[styles.pnlText, { color: tone }]}>
          {formatSignedAmount(summary.pnl)} ({formatSignedPercent(summary.pnlPct)})
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Modal terpakai</Text>
          <Text style={styles.statValue}>${formatAmount(summary.invested)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Posisi terbuka</Text>
          <Text style={styles.statValue}>{summary.count}</Text>
        </View>
      </View>
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
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: palette.subtle,
  },
  total: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.ink,
    fontVariant: ['tabular-nums'],
  },
  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pnlText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    color: palette.subtle,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.ink,
    fontVariant: ['tabular-nums'],
  },
});
