import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import type { AllocationItem } from '@/client/transactions/types';
import { getBaseAsset } from '@/components/home/format-price';
import { palette } from '@/components/home/palette';

import { CASH_COLOR, CATEGORICAL, OTHER_COLOR, chart } from './chart-colors';
import { formatMoney, formatPercent, toNumber, type MoneyContext } from './format';

const SIZE = 150;
const STROKE = 20;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2;
const MAX_COINS = CATEGORICAL.length - 1;

interface Slice {
  key: string;
  name: string;
  color: string;
  percent: number;
  value: number;
}

/**
 * Koin yang dipegang (nilai terbesar dulu) diberi warna kategori berurutan, saldo USDT selalu
 * abu-abu, dan koin kecil di luar MAX_COINS digabung jadi "Lainnya".
 */
function buildSlices(allocation: AllocationItem[]): Slice[] {
  const coins = allocation.filter((item) => item.symbol !== 'USDT');
  const cash = allocation.find((item) => item.symbol === 'USDT');

  const slices: Slice[] = coins.slice(0, MAX_COINS).map((item, index) => ({
    key: item.symbol,
    name: getBaseAsset(item.symbol),
    color: CATEGORICAL[index],
    percent: toNumber(item.percent) ?? 0,
    value: toNumber(item.value) ?? 0,
  }));

  const rest = coins.slice(MAX_COINS);
  if (rest.length > 0) {
    slices.push({
      key: 'other',
      name: `Lainnya (${rest.length})`,
      color: OTHER_COLOR,
      percent: rest.reduce((sum, item) => sum + (toNumber(item.percent) ?? 0), 0),
      value: rest.reduce((sum, item) => sum + (toNumber(item.value) ?? 0), 0),
    });
  }

  if (cash) {
    slices.push({
      key: 'USDT',
      name: 'USDT (saldo bebas)',
      color: CASH_COLOR,
      percent: toNumber(cash.percent) ?? 0,
      value: toNumber(cash.value) ?? 0,
    });
  }

  return slices.filter((slice) => slice.percent > 0);
}

/** Donat komposisi portofolio. Nilai tiap bagian ada di legenda, jadi warna tidak berdiri sendiri. */
export function AllocationDonut({
  allocation,
  centerLabel,
  centerValue,
  money,
}: {
  allocation: AllocationItem[];
  centerLabel: string;
  centerValue: string;
  money: MoneyContext;
}) {
  const slices = buildSlices(allocation);

  // Panjang busur tiap bagian dan posisi awalnya (jumlah panjang bagian sebelumnya).
  const arcs = slices.map((slice, index) => ({
    slice,
    length: (CIRCUMFERENCE * slice.percent) / 100,
    start: slices
      .slice(0, index)
      .reduce((sum, previous) => sum + (CIRCUMFERENCE * previous.percent) / 100, 0),
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.donut}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={palette.surface}
            strokeWidth={STROKE}
            fill="none"
          />
          {arcs.map(({ slice, length, start }) => {
            const dash = Math.max(length - GAP, 0.5);
            return (
              <Circle
                key={slice.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={slice.color}
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={-start}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
            );
          })}
        </Svg>

        <View style={styles.center} pointerEvents="none">
          <Text style={styles.centerLabel}>{centerLabel}</Text>
          <Text style={styles.centerValue} numberOfLines={1} adjustsFontSizeToFit>
            {centerValue}
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        {slices.map((slice) => (
          <View key={slice.key} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: slice.color }]} />
            <Text style={styles.legendName} numberOfLines={1}>
              {slice.name}
            </Text>
            <Text style={styles.legendValue}>{formatMoney(slice.value, money)}</Text>
            <Text style={styles.legendPercent}>{formatPercent(slice.percent)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  donut: {
    alignSelf: 'center',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZE - STROKE * 2 - 12,
    gap: 1,
  },
  centerLabel: {
    fontSize: 10,
    color: chart.muted,
  },
  centerValue: {
    fontSize: 15,
    fontWeight: '800',
    color: palette.ink,
  },
  legend: {
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink,
  },
  legendValue: {
    fontSize: 12,
    color: palette.subtle,
    fontVariant: ['tabular-nums'],
  },
  legendPercent: {
    width: 56,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: palette.ink,
    fontVariant: ['tabular-nums'],
  },
});
