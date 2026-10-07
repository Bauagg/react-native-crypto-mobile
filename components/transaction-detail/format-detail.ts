import { formatCoinPrice } from '@/components/home/format-asset';
import { EMPTY, toNumber, type MoneyContext } from '@/components/dashboard/format';

/** Harga satuan coin dalam USDT atau IDR; desimal menyesuaikan besar harga supaya koin murah tidak jadi 0. */
export function formatPrice(raw: string | number | null | undefined, money: MoneyContext) {
  const value = typeof raw === 'number' ? raw : toNumber(raw);
  if (value === null) return EMPTY;

  if (money.currency === 'IDR' && money.rate !== null) {
    const idr = value * money.rate;
    const digits = idr >= 1000 ? 0 : idr >= 1 ? 2 : 4;
    return `Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: digits }).format(idr)}`;
  }
  return `$${formatCoinPrice(value)}`;
}

/** Jumlah koin; desimal lebih banyak untuk jumlah kecil (mis. 0.00082917 BTC). */
export function formatQty(raw: string | number | null | undefined) {
  const value = typeof raw === 'number' ? raw : toNumber(raw);
  if (value === null) return EMPTY;
  const digits = value >= 100 ? 2 : value >= 1 ? 4 : 8;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);
}

/** Lama posisi dipegang: dari BE kalau CLOSED, dihitung dari waktu buka kalau masih OPEN. */
export function holdingDays(openedAt: string, closedAt: string | null, fromServer: number) {
  if (closedAt) return fromServer;
  const opened = new Date(openedAt).getTime();
  if (Number.isNaN(opened)) return fromServer;
  return Math.max(0, Math.floor((Date.now() - opened) / (24 * 60 * 60 * 1000)));
}
