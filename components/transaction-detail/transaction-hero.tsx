import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { TransactionDetail } from '@/client/transactions/types';
import {
  EMPTY,
  formatPercent,
  formatSignedMoney,
  toNumber,
  type MoneyContext,
} from '@/components/dashboard/format';
import { getBaseAsset, getQuoteAsset } from '@/components/home/format-price';
import { palette } from '@/components/home/palette';

export interface LivePnl {
  value: number;
  percent: number;
}

function Badge({
  label,
  color,
  background,
}: {
  label: string;
  color: string;
  background: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function TransactionHero({
  tx,
  money,
  livePnl,
  currencyToggle,
}: {
  tx: TransactionDetail;
  money: MoneyContext;
  /** Untung/rugi berjalan untuk posisi OPEN; null selama belum ada harga live. */
  livePnl: LivePnl | null;
  currencyToggle?: React.ReactNode;
}) {
  const base = getBaseAsset(tx.symbol);
  const quote = getQuoteAsset(tx.symbol);
  const isOpen = tx.status === 'OPEN';

  const pnlValue = isOpen ? (livePnl?.value ?? null) : toNumber(tx.pnl_amount);
  const pnlPercent = isOpen ? (livePnl?.percent ?? null) : toNumber(tx.pnl_percent);
  const tone =
    pnlValue === null || pnlValue === 0 ? palette.ink : pnlValue > 0 ? palette.up : palette.down;

  const statusBadge = isOpen
    ? { label: 'OPEN', color: palette.accent, background: '#EAF0FF' }
    : tx.result === 'PROFIT'
      ? { label: 'PROFIT', color: palette.up, background: palette.upSoft }
      : { label: 'LOSS', color: palette.down, background: palette.downSoft };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          {tx.photo_url ? (
            <Image source={{ uri: tx.photo_url }} style={styles.icon} contentFit="cover" />
          ) : (
            <View style={[styles.icon, styles.iconPlaceholder]}>
              <Text style={styles.iconPlaceholderText}>{base.slice(0, 1)}</Text>
            </View>
          )}
          <View style={styles.flexShrink}>
            <Text style={styles.name}>
              {base}
              <Text style={styles.quote}>/{quote}</Text>
            </Text>
            <Text style={styles.source} numberOfLines={1}>
              {tx.source === 'BOT' ? `Robot${tx.strategy ? ` · ${tx.strategy}` : ''}` : 'Manual'}
            </Text>
          </View>
        </View>
        {currencyToggle}
      </View>

      <View style={styles.badgeRow}>
        <Badge {...statusBadge} />
        <Badge
          label={tx.account_mode}
          color={tx.account_mode === 'LIVE' ? palette.down : palette.subtle}
          background={tx.account_mode === 'LIVE' ? palette.downSoft : palette.surface}
        />
      </View>

      <View style={styles.pnlBlock}>
        <Text style={styles.pnlLabel}>{isOpen ? 'Untung/rugi berjalan' : 'Untung/rugi akhir'}</Text>
        <Text style={[styles.pnlValue, { color: tone }]} numberOfLines={1} adjustsFontSizeToFit>
          {pnlValue === null ? EMPTY : formatSignedMoney(pnlValue, money)}
        </Text>
        <View style={styles.pnlRow}>
          {pnlValue !== null && pnlValue !== 0 ? (
            <Ionicons name={pnlValue > 0 ? 'trending-up' : 'trending-down'} size={14} color={tone} />
          ) : null}
          <Text style={[styles.pnlPercent, { color: tone }]}>
            {pnlPercent === null ? EMPTY : formatPercent(pnlPercent, true)}
          </Text>
        </View>
        {isOpen ? (
          <Text style={styles.hint}>
            {livePnl
              ? 'Dihitung dari harga live, belum dipotong fee jual (sekitar 0,1%).'
              : 'Menunggu harga live...'}
          </Text>
        ) : null}
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
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconPlaceholder: {
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholderText: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.subtle,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.ink,
  },
  quote: {
    fontSize: 13,
    fontWeight: '400',
    color: palette.subtle,
  },
  source: {
    fontSize: 12,
    color: palette.subtle,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  pnlBlock: {
    gap: 2,
    paddingTop: 4,
  },
  pnlLabel: {
    fontSize: 12,
    color: palette.subtle,
  },
  pnlValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pnlPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    fontSize: 11,
    color: palette.subtle,
    marginTop: 4,
  },
});
