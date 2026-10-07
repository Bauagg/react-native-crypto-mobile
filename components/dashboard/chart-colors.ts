import { palette } from '@/components/home/palette';

/**
 * Warna kategori untuk donat portofolio, urutan tetap (jangan diputar/di-generate).
 * Palet referensi dataviz, sudah divalidasi: lolos semua pemeriksaan pada permukaan kartu putih.
 * Tiga warna terang (aqua, kuning, magenta) berkontras < 3:1, jadi legenda wajib menampilkan
 * nama, persen, dan nilai di samping donat, supaya identitas tidak bergantung pada warna saja.
 */
export const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7'];

/** Saldo USDT bebas selalu abu-abu netral supaya warna koin tidak bergeser. */
export const CASH_COLOR = '#898781';

/** Gabungan koin kecil di luar 6 teratas. */
export const OTHER_COLOR = '#c3c2b7';

export const chart = {
  line: palette.accent,
  grid: '#e1e0d9',
  baseline: '#c3c2b7',
  muted: '#898781',
  surface: palette.card,
  up: palette.up,
  down: palette.down,
};
