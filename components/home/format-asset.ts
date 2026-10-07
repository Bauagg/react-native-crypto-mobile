/** Jumlah uang dalam USDT, 2 desimal, mis. 1.234,56 */
export function formatAmount(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Harga satuan coin: makin kecil harganya, makin banyak desimal. */
export function formatCoinPrice(value: number) {
  const digits = value >= 1000 ? 2 : value >= 1 ? 3 : 6;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);
}

/** Jumlah coin yang dipegang. */
export function formatQuantity(value: number) {
  const digits = value >= 100 ? 2 : value >= 1 ? 4 : 6;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);
}

/** +1.23% / -0.50% */
export function formatSignedPercent(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/** +1.23 / -0.50 */
export function formatSignedAmount(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${formatAmount(Math.abs(value))}`;
}

/** Jumlah hari penuh sejak waktu tertentu sampai sekarang; 0 kalau belum genap sehari atau tanggal tidak valid. */
export function daysSince(iso: string) {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return 0;
  return Math.max(0, Math.floor((Date.now() - time) / (24 * 60 * 60 * 1000)));
}

/** "2026-10-02T15:56:29Z" -> "2 Okt 2026, 22.56" (waktu lokal perangkat) */
export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${time}`;
}
