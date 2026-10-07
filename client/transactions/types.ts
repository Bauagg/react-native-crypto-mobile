export type AccountMode = 'DEMO' | 'LIVE';

/** Filter hasil di riwayat: ALL = semua transaksi tertutup. */
export type HistoryResultFilter = 'ALL' | 'PROFIT' | 'LOSS';

/** Urutan riwayat: terbaru/terlama berdasarkan waktu tutup, terbaik/terburuk berdasarkan untung/rugi. */
export type HistorySort = 'NEWEST' | 'OLDEST' | 'BEST' | 'WORST';

export interface HistoryQuery {
  mode: AccountMode;
  /** Cari simbol, sebagian dan tidak peduli huruf besar/kecil. Kosong = tanpa pencarian. */
  search: string;
  result: HistoryResultFilter;
  sort: HistorySort;
}

/** Sumber transaksi di dasbor: ALL = robot dan manual. */
export type DashboardSource = 'ALL' | 'BOT' | 'MANUAL';

/** Periode di dasbor, dihitung di FE menjadi date_from. */
export type DashboardPeriod = 'ALL' | '30D' | '3M' | 'YTD';

export interface DashboardQuery {
  mode: AccountMode;
  source: DashboardSource;
  period: DashboardPeriod;
}

export interface TradeHighlight {
  id: string;
  symbol: string;
  pnl_amount: string;
  pnl_percent: string;
  closed_at: string;
}

export interface MonthStat {
  /** YYYY-MM */
  month: string;
  pnl: string;
  pnl_percent: string | null;
  trades: number;
  wins: number;
}

export interface DashboardSummary {
  initial_capital: string | null;
  cash: string | null;
  open_value: string;
  total_value: string | null;
  total_return_amount: string | null;
  total_return_percent: string | null;
  realized_pnl: string;
  unrealized_pnl: string;
  total_fee: string;
  closed_trades: number;
  open_positions: number;
  win_count: number;
  loss_count: number;
  win_rate: string;
  avg_profit: string;
  avg_loss: string;
  best_trade: TradeHighlight | null;
  worst_trade: TradeHighlight | null;
  avg_holding_days: string;
  max_drawdown_percent: string;
  profitable_months: number;
  total_months: number;
  best_month: MonthStat | null;
  worst_month: MonthStat | null;
}

export interface EquityPoint {
  /** YYYY-MM-DD */
  date: string;
  realized_pnl: string;
  cumulative_pnl: string;
  equity: string | null;
  drawdown_percent: string;
}

export interface AssetStat {
  symbol: string;
  photo_url: string | null;
  closed_trades: number;
  wins: number;
  win_rate: string;
  realized_pnl: string;
  contribution_percent: string | null;
  best_trade: string | null;
  worst_trade: string | null;
  avg_holding_days: string;
  open_quantity: string;
  open_value: string;
  unrealized_pnl: string;
}

export interface AllocationItem {
  /** Simbol coin, atau "USDT" untuk saldo bebas. */
  symbol: string;
  photo_url: string | null;
  value: string;
  percent: string;
}

/** Respons GET /transactions/dashboard. Semua angka dikirim sebagai string, nilai uang dalam USDT. */
export interface DashboardData {
  filter: {
    account_mode: AccountMode;
    source: string | null;
    date_from: string | null;
    date_to: string | null;
  };
  /** Kurs USDT ke IDR, null kalau gagal diambil. */
  usdt_idr_rate: string | null;
  preferred_currency: 'USDT' | 'IDR';
  summary: DashboardSummary;
  equity: EquityPoint[];
  monthly: MonthStat[];
  per_asset: AssetStat[];
  allocation: AllocationItem[];
}

/** Satu posisi trading dari GET /transactions. Angka dikirim BE sebagai string. */
export interface Position {
  id: string;
  symbol: string;
  photo_url: string | null;
  /** BOT = dibuka robot, MANUAL = dibuka user sendiri. */
  source: string;
  /** Strategi robot, mis. V23. null untuk posisi manual. */
  strategy: string | null;
  status: string;
  account_mode: AccountMode;
  currency: string;
  /** ISO timestamp */
  opened_at: string;
  closed_at: string | null;
  holding_days: number;
  quantity: string;
  entry_price: string;
  entry_value: string;
  /** Hanya terisi untuk posisi CLOSED. */
  exit_price: string | null;
  exit_value: string | null;
  fee_amount: string;
  pnl_amount: string;
  pnl_percent: string;
  /** "PROFIT" / "LOSS" untuk posisi CLOSED, null selama masih OPEN. */
  result: 'PROFIT' | 'LOSS' | null;
}

/** Satu eksekusi (fill) di dalam respons order Binance. */
export interface OrderFill {
  price: string;
  qty: string;
  commission: string;
  /** Aset tempat fee dibayar: koin itu sendiri, USDT, atau BNB. */
  commissionAsset: string;
  tradeId: number;
}

/** Respons order Binance yang disimpan sebagai bukti (hanya posisi LIVE). */
export interface BinanceOrder {
  symbol: string;
  orderId: number;
  side: 'BUY' | 'SELL' | string;
  type: string;
  /** FILLED = terisi penuh. */
  status: string;
  /** Waktu eksekusi, milidetik Unix. */
  transactTime: number;
  /** Jumlah koin yang terisi, sebelum fee. */
  executedQty: string;
  /** Total USDT yang berpindah, sebelum fee. */
  cummulativeQuoteQty: string;
  fills?: OrderFill[];
}

/** Respons GET /transactions/:id: satu posisi (beli lalu jual satu coin), bentuknya sama dengan list ditambah detail. */
export interface TransactionDetail extends Position {
  flex_param_id: string;
  /** Kurs 1 USDT dalam Rupiah saat posisi dibuka. */
  usdt_idr_rate: string | null;
  /** Total modal akun saat posisi dibuka (USDT). */
  account_capital: string;
  entry_order_id: string | null;
  exit_order_id: string | null;
  entry_order_response: BinanceOrder | null;
  exit_order_response: BinanceOrder | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}
