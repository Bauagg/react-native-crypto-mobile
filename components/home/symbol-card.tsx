import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatIdrPrice, formatPercent, getBaseAsset, getQuoteAsset } from './format-price';
import { palette } from './palette';
import type { MarketSymbol } from '@/client/market/types';

export function SymbolCard({ item, onPress }: { item: MarketSymbol; onPress?: () => void }) {
  const percent = formatPercent(item.price_change_percent);
  const base = getBaseAsset(item.symbol);
  const quote = getQuoteAsset(item.symbol);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.leading}>
        {item.photo_url ? (
          <Image source={{ uri: item.photo_url }} style={styles.icon} contentFit="cover" />
        ) : (
          <View style={[styles.icon, styles.iconPlaceholder]}>
            <Text style={styles.iconPlaceholderText}>{base.slice(0, 1)}</Text>
          </View>
        )}

        <View style={styles.namesWrap}>
          <Text style={styles.baseAsset}>{base}</Text>
          <Text style={styles.quoteAsset}>/{quote}</Text>
        </View>
      </View>

      <View style={styles.trailing}>
        <Text style={styles.price}>{formatIdrPrice(item.last_price)}</Text>
        <View style={[styles.percentPill, percent.isUp ? styles.percentUp : styles.percentDown]}>
          <Ionicons
            name={percent.isUp ? 'caret-up' : 'caret-down'}
            size={10}
            color={percent.isUp ? palette.up : palette.down}
          />
          <Text style={[styles.percentText, { color: percent.isUp ? palette.up : palette.down }]}>
            {percent.label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  trailing: {
    alignItems: 'flex-end',
    gap: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.ink,
    fontVariant: ['tabular-nums'],
  },
  percentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  percentUp: {
    backgroundColor: palette.upSoft,
  },
  percentDown: {
    backgroundColor: palette.downSoft,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
