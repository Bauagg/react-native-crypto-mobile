import type { TransactionDetail } from '@/client/transactions/types';
import { EMPTY, formatMoney, toNumber, type MoneyContext } from '@/components/dashboard/format';
import { SectionCard } from '@/components/dashboard/section-card';
import { formatDateTime } from '@/components/home/format-asset';
import { getBaseAsset } from '@/components/home/format-price';

import { DetailRow, RowDivider } from './detail-row';
import { formatPrice, formatQty, holdingDays } from './format-detail';

/** Rincian beli, jual (atau masih dipegang), serta biaya dan modal. */
export function TradeSections({
  tx,
  money,
  livePrice,
}: {
  tx: TransactionDetail;
  money: MoneyContext;
  /** Harga live untuk posisi OPEN; null kalau belum ada. */
  livePrice: number | null;
}) {
  const base = getBaseAsset(tx.symbol);
  const isOpen = tx.status === 'OPEN';
  const days = holdingDays(tx.opened_at, tx.closed_at, tx.holding_days);
  const rate = toNumber(tx.usdt_idr_rate);
  const quantity = toNumber(tx.quantity) ?? 0;

  return (
    <>
      <SectionCard title="Pembelian">
        <DetailRow label="Waktu beli" value={formatDateTime(tx.opened_at)} />
        <RowDivider />
        <DetailRow label="Harga beli" value={formatPrice(tx.entry_price, money)} hint="rata-rata per koin" />
        <RowDivider />
        <DetailRow label="Jumlah" value={`${formatQty(tx.quantity)} ${base}`} />
        <RowDivider />
        <DetailRow label="Total beli" value={formatMoney(tx.entry_value, money)} />
      </SectionCard>

      {isOpen ? (
        <SectionCard title="Posisi Saat Ini">
          <DetailRow label="Status" value="Masih dipegang" hint={`${days} hari sejak dibeli`} />
          <RowDivider />
          <DetailRow
            label="Harga sekarang"
            value={livePrice === null ? EMPTY : formatPrice(livePrice, money)}
          />
          <RowDivider />
          <DetailRow
            label="Nilai sekarang"
            value={livePrice === null ? EMPTY : formatMoney(quantity * livePrice, money)}
          />
        </SectionCard>
      ) : (
        <SectionCard title="Penjualan">
          <DetailRow label="Waktu jual" value={tx.closed_at ? formatDateTime(tx.closed_at) : EMPTY} />
          <RowDivider />
          <DetailRow label="Harga jual" value={formatPrice(tx.exit_price, money)} hint="rata-rata per koin" />
          <RowDivider />
          <DetailRow label="Total jual" value={formatMoney(tx.exit_value, money)} hint="setelah fee jual" />
        </SectionCard>
      )}

      <SectionCard title="Biaya & Lainnya">
        <DetailRow
          label="Fee"
          value={formatMoney(tx.fee_amount, money)}
          hint={isOpen ? 'fee beli saja' : 'fee beli + jual'}
        />
        <RowDivider />
        <DetailRow label="Lama dipegang" value={`${days} hari`} />
        <RowDivider />
        <DetailRow label="Modal akun saat dibuka" value={formatMoney(tx.account_capital, money)} />
        <RowDivider />
        <DetailRow
          label="Kurs saat dibeli"
          value={
            rate === null
              ? EMPTY
              : `Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(rate)}`
          }
          hint="per 1 USDT"
        />
      </SectionCard>
    </>
  );
}
