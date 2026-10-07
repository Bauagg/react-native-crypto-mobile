import api from '@/utils/api/api';

import { unwrap, unwrapData } from '../unwrap';
import type {
  AccountMode,
  DashboardData,
  DashboardPeriod,
  DashboardQuery,
  HistoryQuery,
  HistorySort,
  Position,
  TransactionDetail,
} from './types';

const MAX_POSITIONS = 50;
export const HISTORY_PAGE_SIZE = 20;

/** GET /transactions: posisi yang sedang dipegang (status OPEN) untuk satu mode akun. */
export async function getOpenPositions(mode: AccountMode) {
  const filter = [
    { key: 'status', operator: 'equal', value: 'OPEN' },
    { key: 'account_mode', operator: 'equal', value: mode },
  ];
  const res = unwrap(
    await api.get<Position[]>('transactions', {
      filter: JSON.stringify(filter),
      limit: MAX_POSITIONS,
    }),
    'Gagal mengambil aset'
  );
  return res.data ?? [];
}

const HISTORY_SORT: Record<HistorySort, { sort: string; order: 'asc' | 'desc' }> = {
  NEWEST: { sort: 'closed_at', order: 'desc' },
  OLDEST: { sort: 'closed_at', order: 'asc' },
  BEST: { sort: 'pnl_amount', order: 'desc' },
  WORST: { sort: 'pnl_amount', order: 'asc' },
};

/** GET /transactions/:id: detail satu posisi trading. 404 kalau tidak ada atau milik user lain. */
export async function getTransaction(id: string) {
  return unwrapData(
    await api.get<TransactionDetail>(`transactions/${id}`),
    'Gagal mengambil detail transaksi'
  );
}

function toDateParam(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Periode jadi date_from (UTC, inklusif). date_to dikosongkan = sampai sekarang. */
function periodToDateFrom(period: DashboardPeriod) {
  if (period === 'ALL') return undefined;

  const now = new Date();
  if (period === '30D') {
    return toDateParam(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
  }
  if (period === '3M') {
    return toDateParam(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, now.getUTCDate())));
  }
  return toDateParam(new Date(Date.UTC(now.getUTCFullYear(), 0, 1)));
}

/** GET /transactions/dashboard: ringkasan performa, grafik modal, per bulan, per aset, portofolio. */
export async function getDashboard(query: DashboardQuery) {
  const dateFrom = periodToDateFrom(query.period);

  return unwrapData(
    await api.get<DashboardData>('transactions/dashboard', {
      account_mode: query.mode,
      ...(query.source !== 'ALL' ? { source: query.source } : {}),
      ...(dateFrom ? { date_from: dateFrom } : {}),
    }),
    'Gagal mengambil dasbor'
  );
}

/** GET /transactions: riwayat posisi yang sudah ditutup (status CLOSED), paginated. */
export async function getClosedTransactions(
  params: HistoryQuery & { page: number; limit?: number }
) {
  const filter: { key: string; operator: string; value: string }[] = [
    { key: 'status', operator: 'equal', value: 'CLOSED' },
    { key: 'account_mode', operator: 'equal', value: params.mode },
  ];
  if (params.result !== 'ALL') {
    filter.push({ key: 'result', operator: 'equal', value: params.result });
  }

  const res = unwrap(
    await api.get<Position[]>('transactions', {
      filter: JSON.stringify(filter),
      page: params.page,
      limit: params.limit ?? HISTORY_PAGE_SIZE,
      ...HISTORY_SORT[params.sort],
      ...(params.search ? { search: params.search } : {}),
    }),
    'Gagal mengambil riwayat transaksi'
  );
  return { items: res.data ?? [], meta: res.meta };
}
