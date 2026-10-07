import { useMemo, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';

import type { MonthStat } from '@/client/transactions/types';
import { palette } from '@/components/home/palette';

import { chart } from './chart-colors';
import {
  formatCompactMoney,
  formatMonth,
  formatPercent,
  formatSignedMoney,
  toNumber,
  type MoneyContext,
} from './format';

const HEIGHT = 170;
const PAD = { top: 12, right: 12, bottom: 24, left: 56 };
const MAX_MONTHS = 12;
const CORNER = 4;

/** Bulan tanpa trade tidak dikirim BE, jadi diisi 0 supaya sumbu waktu tidak melompat. */
function fillMonths(months: MonthStat[]): MonthStat[] {
  if (months.length === 0) return [];

  const byMonth = new Map(months.map((m) => [m.month, m]));
  const [firstYear, firstMonth] = months[0].month.split('-').map(Number);
  const [lastYear, lastMonth] = months[months.length - 1].month.split('-').map(Number);

  const filled: MonthStat[] = [];
  let year = firstYear;
  let month = firstMonth;
  while (year < lastYear || (year === lastYear && month <= lastMonth)) {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    filled.push(byMonth.get(key) ?? { month: key, pnl: '0', pnl_percent: null, trades: 0, wins: 0 });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return filled.slice(-MAX_MONTHS);
}

/** Batang tegak dengan ujung data membulat 4px; bernilai nol digambar sebagai garis tipis. */
function barPath(x: number, w: number, zeroY: number, valueY: number) {
  const h = Math.abs(valueY - zeroY);
  if (h < 1) return `M${x} ${zeroY - 0.75} h${w} v1.5 h${-w} Z`;

  const r = Math.min(CORNER, h / 2, w / 2);
  if (valueY < zeroY) {
    return `M${x} ${zeroY} L${x} ${valueY + r} Q${x} ${valueY} ${x + r} ${valueY} L${x + w - r} ${valueY} Q${x + w} ${valueY} ${x + w} ${valueY + r} L${x + w} ${zeroY} Z`;
  }
  return `M${x} ${zeroY} L${x} ${valueY - r} Q${x} ${valueY} ${x + r} ${valueY} L${x + w - r} ${valueY} Q${x + w} ${valueY} ${x + w} ${valueY - r} L${x + w} ${zeroY} Z`;
}

/** Untung/rugi per bulan. Sentuh batang untuk melihat rinciannya. */
export function MonthlyChart({ months, money }: { months: MonthStat[]; money: MoneyContext }) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const data = useMemo(() => fillMonths(months), [months]);
  const pnls = data.map((m) => toNumber(m.pnl) ?? 0);

  const plotW = Math.max(width - PAD.left - PAD.right, 1);
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const rawMax = Math.max(0, ...pnls);
  const rawMin = Math.min(0, ...pnls);
  const span = rawMax - rawMin || 1;
  const yMax = rawMax + span * 0.1;
  const yMin = rawMin - (rawMin < 0 ? span * 0.1 : 0);
  const yFor = (value: number) => PAD.top + (1 - (value - yMin) / (yMax - yMin)) * plotH;
  const zeroY = yFor(0);

  const slot = plotW / Math.max(data.length, 1);
  const barW = Math.min(30, slot * 0.6);

  const active = selected ?? data.length - 1;
  const activeMonth = data[active];
  const activePnl = pnls[active];

  const select = (event: GestureResponderEvent) => {
    const index = Math.floor((event.nativeEvent.locationX - PAD.left) / slot);
    setSelected(Math.min(Math.max(index, 0), data.length - 1));
  };

  const labelStep = data.length > 8 ? 2 : 1;

  return (
    <View>
      <View style={styles.readout}>
        <Text style={styles.readoutDate}>{formatMonth(activeMonth.month)}</Text>
        <Text
          style={[
            styles.readoutValue,
            { color: activePnl > 0 ? palette.up : activePnl < 0 ? palette.down : palette.ink },
          ]}>
          {formatSignedMoney(activePnl, money)}
          {activeMonth.pnl_percent !== null ? (
            <Text style={styles.readoutLabel}> ({formatPercent(activeMonth.pnl_percent, true)})</Text>
          ) : null}
        </Text>
        <Text style={styles.readoutSub}>
          {activeMonth.trades > 0
            ? `${activeMonth.trades} trade · ${activeMonth.wins} untung`
            : 'Tidak ada trade ditutup'}
        </Text>
      </View>

      <View
        style={styles.chart}
        onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={select}
        onResponderMove={select}>
        {width > 0 ? (
          <Svg width={width} height={HEIGHT}>
            {[rawMax > 0 ? rawMax : null, rawMin < 0 ? rawMin : null].map((value, i) =>
              value === null ? null : (
                <Line
                  key={i}
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={yFor(value)}
                  y2={yFor(value)}
                  stroke={chart.grid}
                  strokeWidth={1}
                />
              )
            )}
            {[rawMax > 0 ? rawMax : null, rawMin < 0 ? rawMin : null].map((value, i) =>
              value === null ? null : (
                <SvgText
                  key={`t${i}`}
                  x={PAD.left - 8}
                  y={yFor(value) + 3.5}
                  fontSize={10}
                  fill={chart.muted}
                  textAnchor="end">
                  {formatCompactMoney(value, money)}
                </SvgText>
              )
            )}
            <SvgText x={PAD.left - 8} y={zeroY + 3.5} fontSize={10} fill={chart.muted} textAnchor="end">
              0
            </SvgText>

            {data.map((month, i) => {
              const x = PAD.left + slot * i + (slot - barW) / 2;
              const value = pnls[i];
              return (
                <Path
                  key={month.month}
                  d={barPath(x, barW, zeroY, yFor(value))}
                  fill={value < 0 ? chart.down : chart.up}
                  opacity={i === active ? 1 : 0.55}
                />
              );
            })}

            <Line x1={PAD.left} x2={width - PAD.right} y1={zeroY} y2={zeroY} stroke={chart.baseline} strokeWidth={1} />

            {data.map((month, i) =>
              i % labelStep === 0 || i === data.length - 1 ? (
                <SvgText
                  key={`m${month.month}`}
                  x={PAD.left + slot * i + slot / 2}
                  y={HEIGHT - 6}
                  fontSize={10}
                  fill={i === active ? palette.ink : chart.muted}
                  fontWeight={i === active ? '700' : '400'}
                  textAnchor="middle">
                  {formatMonth(month.month, 'short')}
                </SvgText>
              ) : null
            )}
          </Svg>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  readout: {
    gap: 2,
    marginBottom: 6,
  },
  readoutDate: {
    fontSize: 11,
    color: palette.subtle,
  },
  readoutValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  readoutLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  readoutSub: {
    fontSize: 11,
    color: palette.subtle,
  },
  chart: {
    height: HEIGHT,
  },
});
