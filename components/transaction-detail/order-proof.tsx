import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { BinanceOrder, TransactionDetail } from '@/client/transactions/types';
import { palette } from '@/components/home/palette';

import { DetailRow, RowDivider } from './detail-row';
import { formatQty } from './format-detail';

function formatExecutionTime(ms: number) {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return '–';
  const day = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return `${day}, ${time}`;
}

function OrderBlock({
  title,
  orderId,
  order,
}: {
  title: string;
  orderId: string | null;
  order: BinanceOrder | null;
}) {
  const filled = order?.status === 'FILLED';

  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <DetailRow label="Order ID" value={order ? String(order.orderId) : (orderId ?? '–')} />
      {order ? (
        <>
          <RowDivider />
          <DetailRow label="Jenis" value={`${order.side} · ${order.type}`} />
          <RowDivider />
          <DetailRow
            label="Status"
            value={filled ? 'Terisi penuh' : order.status}
            valueColor={filled ? palette.up : undefined}
          />
          <RowDivider />
          <DetailRow label="Waktu eksekusi" value={formatExecutionTime(order.transactTime)} />
          <RowDivider />
          <DetailRow label="Jumlah terisi" value={formatQty(order.executedQty)} hint="sebelum fee" />
          <RowDivider />
          <DetailRow label="Total USDT" value={formatQty(order.cummulativeQuoteQty)} hint="sebelum fee" />

          {order.fills && order.fills.length > 0 ? (
            <View style={styles.fills}>
              <Text style={styles.fillsTitle}>Rincian eksekusi ({order.fills.length})</Text>
              {order.fills.map((fill) => (
                <View key={fill.tradeId} style={styles.fillRow}>
                  <Text style={styles.fillMain}>
                    {formatQty(fill.qty)} @ {formatQty(fill.price)}
                  </Text>
                  <Text style={styles.fillSub}>
                    Fee {formatQty(fill.commission)} {fill.commissionAsset}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

/**
 * Bukti order Binance (khusus posisi LIVE). Bisa dibuka-tutup, tertutup secara default.
 * Untuk DEMO dan posisi manual, field order selalu null sehingga bagian ini tidak tampil.
 */
export function OrderProof({ tx }: { tx: TransactionDetail }) {
  const [open, setOpen] = useState(false);

  const hasEntry = tx.entry_order_id !== null || tx.entry_order_response !== null;
  const hasExit = tx.exit_order_id !== null || tx.exit_order_response !== null;
  if (!hasEntry && !hasExit) return null;

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={() => setOpen((value) => !value)}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Bukti Order Binance</Text>
          <Text style={styles.subtitle}>Respons asli dari exchange</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={palette.subtle} />
      </Pressable>

      {open ? (
        <View style={styles.body}>
          {hasEntry ? (
            <OrderBlock title="Order Beli" orderId={tx.entry_order_id} order={tx.entry_order_response} />
          ) : null}
          {hasExit ? (
            <OrderBlock title="Order Jual" orderId={tx.exit_order_id} order={tx.exit_order_response} />
          ) : null}
        </View>
      ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerText: {
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.ink,
  },
  subtitle: {
    fontSize: 11,
    color: palette.subtle,
  },
  body: {
    gap: 16,
  },
  block: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.ink,
    paddingTop: 4,
  },
  fills: {
    gap: 6,
    paddingVertical: 8,
  },
  fillsTitle: {
    fontSize: 11,
    color: palette.subtle,
  },
  fillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  fillMain: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.ink,
    fontVariant: ['tabular-nums'],
  },
  fillSub: {
    fontSize: 11,
    color: palette.subtle,
  },
});
