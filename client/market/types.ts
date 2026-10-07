/** Item GET /market/symbols. Angka dikirim BE sebagai string. */
export interface MarketSymbol {
  symbol: string;
  photo_url: string | null;
  last_price: string;
  price_change_percent: string;
}

/** Pesan WebSocket /market/ws/tickers (bentuknya sama dengan MarketSymbol tanpa photo_url). */
export interface Ticker {
  symbol: string;
  last_price: string;
  price_change_percent: string;
}

export type RecommendationGroup = 'UTAMA' | 'PELENGKAP';

export interface HistoricalStats {
  avg_loss: number;
  avg_win: number;
  expectancy: number;
  hit_stop: number;
  n: number;
  win_rate: number;
}

export interface RecommendationPlan {
  entry: string;
  hard_stop_pct: number;
  hold_days: number;
  sell_on: string;
  stop_loss_price_estimate: number;
}

export interface Recommendation {
  id: string;
  symbol: string;
  image_url: string | null;
  rank: number;
  previous_rank: number | null;
  /** null = baru masuk 10 besar hari ini */
  rank_change: number | null;
  group: RecommendationGroup;
  market_cap_category: string;
  score: number;
  close: number;
  /** Rasio, mis. 0.015 = +1.5% */
  change_1d: number;
  change_7d: number;
  rsi14: number;
  rsi7: number;
  explanations: string[];
  historical_stats: HistoricalStats;
  plan: RecommendationPlan;
}

export interface MarketRegime {
  status: 'RISK_ON' | 'RISK_OFF' | string;
  explanation: string;
  btc_above_sma100: boolean;
  btc_close: number;
  btc_sma100: number;
  fear_greed: number;
  fear_greed_avg_14d: number;
}

export interface DroppedSymbol {
  id: string;
  symbol: string;
  image_url: string | null;
}

export interface RecommendationsData {
  date: string;
  next_update: string;
  market: MarketRegime;
  method: {
    groups: string;
    plan: string;
    research: string;
    score: string;
  };
  recommendations: Recommendation[];
  dropped_from_top: DroppedSymbol[];
  universe: {
    btc_included: boolean;
    categories: string[];
    count: number;
  };
  warnings: string[];
}
