export type Currency = 'USDT' | 'IDR';

export interface MoneyContext {
  currency: Currency;
  /** Kurs USDT ke IDR; null/NaN = tampilkan USDT saja. */
  rate: number | null;
}

/** String dari BE ke angka; null/kosong/tidak valid -> null supaya UI menampilkan "–". */
export function toNumber(raw: string | null | undefined) {
  if (raw === null || raw === undefined || raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export const EMPTY = '–';

function formatIdr(value: number) {
  return `Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.abs(value))}`;
}

function formatUsd(value: number) {
  return `$${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))}`;
}

/** Nilai uang (USDT dari BE) sesuai mata uang pilihan. Kurs kosong = selalu USDT. */
export function formatMoney(raw: string | number | null | undefined, money: MoneyContext) {
  const value = typeof raw === 'number' ? raw : toNumber(raw);
  if (value === null) return EMPTY;

  const sign = value < 0 ? '-' : '';
  const useIdr = money.currency === 'IDR' && money.rate !== null;
  return `${sign}${useIdr ? formatIdr(value * (money.rate as number)) : formatUsd(value)}`;
}

/** Nilai uang ringkas untuk label sumbu grafik, mis. $1,013 atau Rp18,1jt. */
export function formatCompactMoney(value: number, money: MoneyContext) {
  const sign = value < 0 ? '-' : '';
  const useIdr = money.currency === 'IDR' && money.rate !== null;

  if (useIdr) {
    const idr = Math.abs(value * (money.rate as number));
    const trim = (n: number) => n.toFixed(1).replace(/\.0$/, '').replace('.', ',');
    if (idr >= 1e9) return `${sign}Rp${trim(idr / 1e9)}M`;
    if (idr >= 1e6) return `${sign}Rp${trim(idr / 1e6)}jt`;
    if (idr >= 1e3) return `${sign}Rp${Math.round(idr / 1e3)}rb`;
    return `${sign}Rp${Math.round(idr)}`;
  }

  const usd = Math.abs(value);
  if (usd >= 1e6) return `${sign}$${(usd / 1e6).toFixed(1)}M`;
  return `${sign}$${new Intl.NumberFormat('en-US', { maximumFractionDigits: usd < 10 ? 2 : 0 }).format(usd)}`;
}

/** Sama seperti formatMoney, tapi nilai positif diberi tanda +. */
export function formatSignedMoney(raw: string | number | null | undefined, money: MoneyContext) {
  const value = typeof raw === 'number' ? raw : toNumber(raw);
  if (value === null) return EMPTY;
  return `${value > 0 ? '+' : ''}${formatMoney(value, money)}`;
}

export function formatPercent(raw: string | number | null | undefined, signed = false) {
  const value = typeof raw === 'number' ? raw : toNumber(raw);
  if (value === null) return EMPTY;
  return `${signed && value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/** "2026-09" -> "Sep 2026" */
export function formatMonth(month: string, style: 'short' | 'long' = 'long') {
  const date = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return month;
  return date.toLocaleDateString('id-ID', {
    month: 'short',
    ...(style === 'long' ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  });
}

/** "2026-09-12" atau ISO timestamp -> "12 Sep 2026" */
export function formatDay(value: string) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "2026-09-12" -> "12 Sep" */
export function formatDayShort(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}
