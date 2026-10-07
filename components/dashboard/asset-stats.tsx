import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { AssetStat } from '@/client/transactions/types';
import { getBaseAsset } from '@/components/home/format-price';
import { palette } from '@/components/home/palette';

import {
  EMPTY,
  formatMoney,
  formatPercent,
  formatSignedMoney,
  toNumber,
  type MoneyContext,
} from './format';
import { SectionCard } from './section-card';

export function AssetStats({ assets, money }: { assets: AssetStat[]; money: MoneyContext }) {
  if (assets.length === 0) return null;

  return (
    <SectionCard title="Statistik per Aset" subtitle="Urut dari untung terealisasi terbesar">
      <View>
        {assets.map((asset, index) => (
          <AssetRow key={asset.symbol} asset={asset} money={money} isFirst={index === 0} />
        ))}
      </View>
    </SectionCard>
  );
}

function tone(raw: string | null) {
  const value = toNumber(raw);
  if (value === null || value === 0) return palette.ink;
  return value > 0 ? palette.up : palette.down;
}

function AssetRow({
  asset,
  money,
  isFirst,
}: {
  asset: AssetStat;
  money: MoneyContext;
  isFirst: boolean;
}) {
  const base = getBaseAsset(asset.symbol);
  const hasClosed = asset.closed_trades > 0;
  const hasOpen = (toNumber(asset.open_quantity) ?? 0) > 0;

  return (
    <View style={[styles.row, !isFirst && styles.rowDivider]}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          {asset.photo_url ? (
            <Image source={{ uri: asset.photo_url }} style={styles.icon} contentFit="cover" />
          ) : (
            <View style={[styles.icon, styles.iconPlaceholder]}>
              <Text style={styles.iconPlaceholderText}>{base.slice(0, 1)}</Text>
            </View>
          )}
          <View style={styles.flexShrink}>
            <Text style={styles.symbol}>{base}</Text>
            <Text style={styles.sub} numberOfLines={1}>
              {hasClosed
                ? `${asset.closed_trades} trade · win rate ${formatPercent(asset.win_rate)}`
                : 'Belum ada trade ditutup'}
            </Text>
          </View>
        </View>

        <View style={styles.pnlWrap}>
          <Text style={[styles.pnl, { color: tone(asset.realized_pnl) }]}>
            {hasClosed ? formatSignedMoney(asset.realized_pnl, money) : EMPTY}
          </Text>
          <Text style={styles.sub}>
            {asset.contribution_percent !== null
              ? `${formatPercent(asset.contribution_percent)} dari total`
              : 'terealisasi'}
          </Text>
        </View>
      </View>

      {hasClosed || hasOpen ? (
        <View style={styles.statsRow}>
          <Cell
            label="Terbaik"
            value={asset.best_trade === null ? EMPTY : formatSignedMoney(asset.best_trade, money)}
            color={tone(asset.best_trade)}
          />
          <Cell
            label="Terburuk"
            value={asset.worst_trade === null ? EMPTY : formatSignedMoney(asset.worst_trade, money)}
            color={tone(asset.worst_trade)}
          />
          <Cell
            label="Dipegang"
            value={hasOpen ? formatMoney(asset.open_value, money) : EMPTY}
            color={palette.ink}
          />
          <Cell
            label="Berjalan"
            value={hasOpen ? formatSignedMoney(asset.unrealized_pnl, money) : EMPTY}
            color={hasOpen ? tone(asset.unrealized_pnl) : palette.ink}
          />
        </View>
      ) : null}
    </View>
  );
}

function Cell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={[styles.cellValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    gap: 10,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
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
    gap: 10,
    flexShrink: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  iconPlaceholder: {
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholderText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.subtle,
  },
  symbol: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.ink,
  },
  sub: {
    fontSize: 10,
    color: palette.subtle,
  },
  pnlWrap: {
    alignItems: 'flex-end',
    gap: 1,
  },
  pnl: {
    fontSize: 14,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: palette.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cell: {
    flex: 1,
    gap: 2,
  },
  cellLabel: {
    fontSize: 9,
    color: palette.subtle,
  },
  cellValue: {
    fontSize: 11,
    fontWeight: '700',
  },
});
