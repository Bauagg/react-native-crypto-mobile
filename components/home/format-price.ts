export function formatIdrPrice(rawValue: string) {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return rawValue;

  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: value < 1000 ? 4 : 0,
  }).format(value);
}

export function formatPercent(rawValue: string) {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return { label: rawValue, isUp: true };

  const sign = value > 0 ? '+' : '';
  return {
    label: `${sign}${value.toFixed(2)}%`,
    isUp: value >= 0,
  };
}

/** "BTCIDR" -> "BTC" (buang pasangan quote umum di akhir simbol). */
export function getBaseAsset(symbol: string) {
  const knownQuotes = ['IDR', 'USDT', 'BUSD', 'BTC', 'ETH'];
  const match = knownQuotes.find((quote) => symbol.endsWith(quote) && symbol.length > quote.length);
  return match ? symbol.slice(0, symbol.length - match.length) : symbol;
}

export function getQuoteAsset(symbol: string) {
  const base = getBaseAsset(symbol);
  return symbol.slice(base.length);
}
