import { StyleSheet, Text, View } from 'react-native';

import type { DashboardSummary } from '@/client/transactions/types';
import { palette } from '@/components/home/palette';

import {
  formatMoney,
  formatPercent,
  formatSignedMoney,
  toNumber,
  type MoneyContext,
} from './format';

type Tone = 'up' | 'down' | 'neutral';

function toneOf(raw: string | null): Tone {
  const value = toNumber(raw);
  if (value === null || value === 0) return 'neutral';
  return value > 0 ? 'up' : 'down';
}

const TONE_COLOR: Record<Tone, string> = {
  up: palette.up,
  down: palette.down,
  neutral: palette.ink,
};

export function StatGrid({ summary, money }: { summary: DashboardSummary; money: MoneyContext }) {
  const tiles: { label: string; value: string; hint?: string; tone?: Tone }[] = [
    {
      label: 'Untung/rugi terealisasi',
      value: formatSignedMoney(summary.realized_pnl, money),
      hint: 'dari posisi yang sudah ditutup',
      tone: toneOf(summary.realized_pnl),
    },
    {
      label: 'Untung/rugi berjalan',
      value: formatSignedMoney(summary.unrealized_pnl, money),
      hint: `${summary.open_positions} posisi terbuka`,
      tone: toneOf(summary.unrealized_pnl),
    },
    {
      label: 'Win rate',
      value: formatPercent(summary.win_rate),
      hint: `${summary.win_count} untung · ${summary.loss_count} rugi`,
    },
    {
      label: 'Trade ditutup',
      value: String(summary.closed_trades),
      hint: `${summary.profitable_months} dari ${summary.total_months} bulan untung`,
    },
    {
      label: 'Rata-rata untung',
      value: formatSignedMoney(summary.avg_profit, money),
      hint: 'per trade yang untung',
      tone: toneOf(summary.avg_profit),
    },
    {
      label: 'Rata-rata rugi',
      value: formatSignedMoney(summary.avg_loss, money),
      hint: 'per trade yang rugi',
      tone: toneOf(summary.avg_loss),
    },
    {
      label: 'Penurunan terdalam',
      value: formatPercent(summary.max_drawdown_percent),
      hint: 'dari puncak modal',
      tone: toneOf(summary.max_drawdown_percent),
    },
    {
      label: 'Rata-rata ditahan',
      value: `${summary.avg_holding_days} hari`,
      hint: 'lama posisi dipegang',
    },
    {
      label: 'Total fee',
      value: formatMoney(summary.total_fee, money),
      hint: 'biaya exchange',
    },
  ];

  return (
    <View style={styles.grid}>
      {tiles.map((tile) => (
        <View key={tile.label} style={styles.tile}>
          <Text style={styles.label} numberOfLines={1}>
            {tile.label}
          </Text>
          <Text
            style={[styles.value, { color: TONE_COLOR[tile.tone ?? 'neutral'] }]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {tile.value}
          </Text>
          {tile.hint ? (
            <Text style={styles.hint} numberOfLines={1}>
              {tile.hint}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    // dua kolom: setengah lebar dikurangi setengah jarak antar kolom
    width: '48.5%',
    flexGrow: 1,
    backgroundColor: palette.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    gap: 3,
  },
  label: {
    fontSize: 11,
    color: palette.subtle,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
  },
  hint: {
    fontSize: 10,
    color: palette.subtle,
  },
});
