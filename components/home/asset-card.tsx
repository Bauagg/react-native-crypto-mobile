import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatAmount,
  formatCoinPrice,
  daysSince,
  formatDateTime,
  formatQuantity,
  formatSignedAmount,
  formatSignedPercent,
} from './format-asset';
import { getBaseAsset, getQuoteAsset } from './format-price';
import { palette } from './palette';
import type { PositionView } from './use-assets';

export function AssetCard({ item, onPress }: { item: PositionView; onPress?: () => void }) {
  const base = getBaseAsset(item.symbol);
  const quote = getQuoteAsset(item.symbol);
  const isUp = item.pnlValue >= 0;
  const tone = isUp ? palette.up : palette.down;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.leading}>
          {item.photo_url ? (
            <Image source={{ uri: item.photo_url }} style={styles.icon} contentFit="cover" />
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
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.strategy ? `${item.source} · ${item.strategy}` : item.source}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.pnlWrap}>
          <Text style={[styles.pnlAmount, { color: tone }]}>
            {formatSignedAmount(item.pnlValue)} {item.currency}
          </Text>
          <View style={[styles.pnlPill, { backgroundColor: isUp ? palette.upSoft : palette.downSoft }]}>
            <Ionicons name={isUp ? 'caret-up' : 'caret-down'} size={10} color={tone} />
            <Text style={[styles.pnlPercent, { color: tone }]}>{formatSignedPercent(item.pnlPct)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <Stat label="Jumlah" value={formatQuantity(Number(item.quantity))} />
        <Stat label="Harga beli" value={`$${formatCoinPrice(Number(item.entry_price))}`} />
        <Stat
          label="Harga kini"
          value={item.currentPrice !== null ? `$${formatCoinPrice(item.currentPrice)}` : '-'}
        />
        <Stat label="Nilai" value={`$${formatAmount(item.currentValue)}`} />
      </View>

      <View style={styles.footerRow}>
        <Ionicons name="time-outline" size={12} color={palette.subtle} />
        <Text style={styles.footerText}>
          Dibuka {formatDateTime(item.opened_at)} · ditahan {daysSince(item.opened_at)} hari
        </Text>
      </View>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
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
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  flexShrink: {
    flexShrink: 1,
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: palette.surface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.subtle,
  },
  pnlWrap: {
    alignItems: 'flex-end',
    gap: 3,
  },
  pnlAmount: {
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pnlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  pnlPercent: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: palette.subtle,
  },
});
