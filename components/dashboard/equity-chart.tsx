import { useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { palette } from '@/components/home/palette';

import { chart } from './chart-colors';
import {
  formatCompactMoney,
  formatDay,
  formatDayShort,
  formatMoney,
  formatSignedMoney,
  type MoneyContext,
} from './format';

export interface EquityChartPoint {
  /** YYYY-MM-DD */
  date: string;
  value: number;
  /** Untung/rugi kumulatif sampai titik ini; null kalau tidak diketahui. */
  pnl: number | null;
}

const HEIGHT = 170;
const PAD = { top: 12, right: 12, bottom: 24, left: 56 };
const TICKS = 3;

/** Garis pertumbuhan modal. Sentuh/geser untuk melihat nilai di tiap titik. */
export function EquityChart({
  points,
  money,
  valueLabel,
}: {
  points: EquityChartPoint[];
  money: MoneyContext;
  valueLabel: string;
}) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const plotW = Math.max(width - PAD.left - PAD.right, 1);
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const times = points.map((point) => new Date(`${point.date}T00:00:00Z`).getTime());
  const t0 = times[0];
  const t1 = times[times.length - 1];

  const values = points.map((point) => point.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * 0.1;
  const yMin = min - pad;
  const yMax = max + pad;

  const xs = times.map((time) =>
    t1 === t0 ? PAD.left + plotW / 2 : PAD.left + ((time - t0) / (t1 - t0)) * plotW
  );
  const yFor = (value: number) => PAD.top + (1 - (value - yMin) / (yMax - yMin)) * plotH;
  const ys = values.map(yFor);

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const baseY = PAD.top + plotH;
  const areaPath = `${linePath} L${xs[xs.length - 1].toFixed(1)} ${baseY} L${xs[0].toFixed(1)} ${baseY} Z`;

  const active = selected ?? points.length - 1;
  const activePoint = points[active];

  const select = (event: GestureResponderEvent) => {
    const x = event.nativeEvent.locationX;
    let nearest = 0;
    for (let i = 1; i < xs.length; i += 1) {
      if (Math.abs(xs[i] - x) < Math.abs(xs[nearest] - x)) nearest = i;
    }
    setSelected(nearest);
  };

  return (
    <View>
      <View style={styles.readout}>
        <Text style={styles.readoutDate}>{formatDay(activePoint.date)}</Text>
        <Text style={styles.readoutValue}>
          {formatMoney(activePoint.value, money)}
          <Text style={styles.readoutLabel}> {valueLabel}</Text>
        </Text>
        {activePoint.pnl !== null ? (
          <Text
            style={[
              styles.readoutPnl,
              { color: activePoint.pnl > 0 ? palette.up : activePoint.pnl < 0 ? palette.down : palette.subtle },
            ]}>
            {formatSignedMoney(activePoint.pnl, money)} sejak awal
          </Text>
        ) : null}
      </View>

      <View
        onLayout={onLayout}
        style={styles.chart}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={select}
        onResponderMove={select}>
        {width > 0 ? (
          <Svg width={width} height={HEIGHT}>
            <Defs>
              <LinearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={chart.line} stopOpacity={0.18} />
                <Stop offset="1" stopColor={chart.line} stopOpacity={0} />
              </LinearGradient>
            </Defs>

            {Array.from({ length: TICKS }).map((_, i) => {
              const value = yMax - ((yMax - yMin) * (i + 0.5)) / TICKS;
              const y = yFor(value);
              return (
                <Line
                  key={i}
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={y}
                  y2={y}
                  stroke={chart.grid}
                  strokeWidth={1}
                />
              );
            })}
            {Array.from({ length: TICKS }).map((_, i) => {
              const value = yMax - ((yMax - yMin) * (i + 0.5)) / TICKS;
              return (
                <SvgText
                  key={`l${i}`}
                  x={PAD.left - 8}
                  y={yFor(value) + 3.5}
                  fontSize={10}
                  fill={chart.muted}
                  textAnchor="end">
                  {formatCompactMoney(value, money)}
                </SvgText>
              );
            })}

            <Line x1={PAD.left} x2={width - PAD.right} y1={baseY} y2={baseY} stroke={chart.baseline} strokeWidth={1} />

            {points.length > 1 ? (
              <>
                <Path d={areaPath} fill="url(#equityFill)" />
                <Path
                  d={linePath}
                  stroke={chart.line}
                  strokeWidth={2}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            ) : null}

            <Line x1={xs[active]} x2={xs[active]} y1={PAD.top} y2={baseY} stroke={chart.baseline} strokeWidth={1} strokeDasharray="3 3" />
            <Circle cx={xs[active]} cy={ys[active]} r={4.5} fill={chart.line} stroke={chart.surface} strokeWidth={2} />

            <SvgText x={PAD.left} y={HEIGHT - 6} fontSize={10} fill={chart.muted} textAnchor="start">
              {formatDayShort(points[0].date)}
            </SvgText>
            {points.length > 1 ? (
              <SvgText x={width - PAD.right} y={HEIGHT - 6} fontSize={10} fill={chart.muted} textAnchor="end">
                {formatDayShort(points[points.length - 1].date)}
              </SvgText>
            ) : null}
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
    color: palette.ink,
  },
  readoutLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: palette.subtle,
  },
  readoutPnl: {
    fontSize: 12,
    fontWeight: '700',
  },
  chart: {
    height: HEIGHT,
  },
});
