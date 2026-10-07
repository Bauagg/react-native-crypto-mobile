import api from '@/utils/api/api';

import { unwrap, unwrapData } from '../unwrap';
import type { MarketSymbol, RecommendationsData } from './types';

export const SYMBOLS_PAGE_SIZE = 20;

/** GET /market/symbols: daftar coin + harga (publik, paginated). */
export async function getSymbols(params: { page: number; limit?: number; search?: string }) {
  const res = unwrap(
    await api.get<MarketSymbol[]>('market/symbols', {
      page: params.page,
      limit: params.limit ?? SYMBOLS_PAGE_SIZE,
      ...(params.search ? { search: params.search } : {}),
    }),
    'Gagal mengambil daftar pair'
  );
  return { items: res.data ?? [], meta: res.meta };
}

/** GET /market/recommendations: top pick harian + kondisi pasar. */
export async function getRecommendations() {
  return unwrapData(
    await api.get<RecommendationsData>('market/recommendations'),
    'Gagal mengambil rekomendasi'
  );
}
