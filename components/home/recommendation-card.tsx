import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getBaseAsset, getQuoteAsset } from './format-price';
import { palette } from './palette';
import type { Recommendation } from '@/client/market/types';

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value < 1 ? 4 : value < 100 ? 3 : 2,
  }).format(value);
}

/** Rasio -> persen, mis. 0.015 -> "+1.50%" */
function formatRatio(value: number) {
  const percent = value * 100;
  const sign = percent > 0 ? '+' : '';
  return { label: `${sign}${percent.toFixed(2)}%`, isUp: percent >= 0 };
}

/** "close 2026-10-15" -> "15 Okt" */
function formatSellDate(sellOn: string) {
  const iso = sellOn.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (!iso) return sellOn;
  return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function RankChange({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <View style={[styles.rankChange, { backgroundColor: palette.accent }]}>
        <Text numberOfLines={1} style={[styles.rankChangeText, { color: '#fff' }]}>
          BARU
        </Text>
      </View>
    );
  }
  if (value === 0) {
    return <Text style={[styles.rankChangeText, { color: palette.subtle }]}>–</Text>;
  }

  const isUp = value > 0;
  return (
    <View style={styles.rankChangeInline}>
      <Ionicons name={isUp ? 'caret-up' : 'caret-down'} size={10} color={isUp ? palette.up : palette.down} />
      <Text style={[styles.rankChangeText, { color: isUp ? palette.up : palette.down }]}>
        {Math.abs(value)}
      </Text>
    </View>
  );
}

export function RecommendationCard({
  item,
  onPress,
}: {
  item: Recommendation;
  onPress?: () => void;
}) {
  const base = getBaseAsset(item.symbol);
  const quote = getQuoteAsset(item.symbol);
  const isMain = item.group === 'UTAMA';
  const change1d = formatRatio(item.change_1d);
  const change7d = formatRatio(item.change_7d);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.leading}>
          <View style={styles.rankWrap}>
            <Text style={styles.rank}>#{item.rank}</Text>
            <RankChange value={item.rank_change} />
          </View>

          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.icon} contentFit="cover" />
          ) : (
            <View style={[styles.icon, styles.iconPlaceholder]}>
              <Text style={styles.iconPlaceholderText}>{base.slice(0, 1)}</Text>
            </View>
          )}

          <View style={styles.flexShrink}>
            <View style={styles.namesWrap}>
              <Text style={styles.baseAsset}>{base}</Text>
              <Text style={styles.quoteAsset}>/{quote}</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, isMain ? styles.badgeMain : styles.badgeExtra]}>
                <Text style={[styles.badgeText, { color: isMain ? palette.accent : palette.subtle }]}>
                  {item.group}
                </Text>
              </View>
              <Text style={styles.capText}>{item.market_cap_category} cap</Text>
            </View>
          </View>
        </View>

        <View style={styles.scoreWrap}>
          <Text style={styles.scoreValue}>{Math.round(item.score * 100)}</Text>
          <Text style={styles.scoreLabel}>Skor</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Harga</Text>
          <Text style={styles.statValue}>${formatUsd(item.close)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>1H</Text>
          <Text style={[styles.statValue, { color: change1d.isUp ? palette.up : palette.down }]}>
            {change1d.label}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>7H</Text>
          <Text style={[styles.statValue, { color: change7d.isUp ? palette.up : palette.down }]}>
            {change7d.label}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>RSI 14/7</Text>
          <Text style={styles.statValue}>
            {Math.round(item.rsi14)}/{Math.round(item.rsi7)}
          </Text>
        </View>
      </View>

      <View style={styles.planRow}>
        <Ionicons name="calendar-outline" size={12} color={palette.subtle} />
        <Text style={styles.planText}>
          Tahan {item.plan.hold_days} hari · jual {formatSellDate(item.plan.sell_on)}
        </Text>
        <Text style={styles.planDot}>·</Text>
        <Text style={[styles.planText, { color: palette.down }]}>
          SL ${formatUsd(item.plan.stop_loss_price_estimate)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  rankWrap: {
    width: 38,
    alignItems: 'center',
    gap: 2,
  },
  rank: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.ink,
    fontVariant: ['tabular-nums'],
  },
  rankChange: {
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  rankChangeInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankChangeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  iconPlaceholder: {
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholderText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.subtle,
  },
  namesWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  baseAsset: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.ink,
  },
  quoteAsset: {
    fontSize: 12,
    color: palette.subtle,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  badgeMain: {
    backgroundColor: '#EAF0FF',
  },
  badgeExtra: {
    backgroundColor: palette.surface,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  capText: {
    fontSize: 10,
    color: palette.subtle,
  },
  scoreWrap: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.accent,
    fontVariant: ['tabular-nums'],
  },
  scoreLabel: {
    fontSize: 10,
    color: palette.subtle,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    color: palette.subtle,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.ink,
    fontVariant: ['tabular-nums'],
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  planText: {
    fontSize: 11,
    color: palette.subtle,
  },
  planDot: {
    fontSize: 11,
    color: palette.subtle,
  },
});
