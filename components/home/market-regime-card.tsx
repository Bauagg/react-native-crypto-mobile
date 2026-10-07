import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';
import type { RecommendationsData } from '@/client/market/types';

export function MarketRegimeCard({ data }: { data: RecommendationsData }) {
  const { market, warnings } = data;
  const isRiskOn = market.status === 'RISK_ON';
  const tone = isRiskOn ? palette.up : palette.down;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.statusBadge, { backgroundColor: isRiskOn ? palette.upSoft : palette.downSoft }]}>
            <Ionicons name={isRiskOn ? 'trending-up' : 'trending-down'} size={12} color={tone} />
            <Text style={[styles.statusText, { color: tone }]}>{market.status.replace('_', '-')}</Text>
          </View>
          <Text style={styles.updateText}>Update {data.next_update}</Text>
        </View>

        <Text style={styles.explanation}>{market.explanation}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Fear & Greed</Text>
            <Text style={styles.statValue}>
              {Math.round(market.fear_greed)}
              <Text style={styles.statSub}> · avg 14h {market.fear_greed_avg_14d.toFixed(1)}</Text>
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>BTC vs SMA100</Text>
            <Text style={[styles.statValue, { color: market.btc_above_sma100 ? palette.up : palette.down }]}>
              {market.btc_above_sma100 ? 'Di atas' : 'Di bawah'}
            </Text>
          </View>
        </View>
      </View>

      {warnings.map((warning) => (
        <View key={warning} style={styles.warning}>
          <Ionicons name="warning-outline" size={14} color="#B45309" />
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginTop: 12,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  updateText: {
    fontSize: 10,
    color: palette.subtle,
    flexShrink: 1,
    textAlign: 'right',
  },
  explanation: {
    fontSize: 12,
    color: palette.subtle,
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
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
  },
  statSub: {
    fontSize: 10,
    fontWeight: '400',
    color: palette.subtle,
  },
  warning: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#FFF7E6',
    borderRadius: 12,
    padding: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#92400E',
  },
});
