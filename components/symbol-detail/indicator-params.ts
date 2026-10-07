export interface IndicatorParamField {
  key: string;
  label: string;
  defaultValue: number;
}

/**
 * Field parameter numerik per indikator, mengikuti signature fungsi kalkulasi
 * di backend-treding-rust (src/indicators/*.rs). Indikator yang tidak disebutkan
 * di sini (mis. OBV, VWAP) tidak butuh parameter.
 */
const INDICATOR_PARAM_FIELDS: Record<string, IndicatorParamField[]> = {
  SMA: [{ key: 'period', label: 'Period', defaultValue: 20 }],
  EMA: [{ key: 'period', label: 'Period', defaultValue: 20 }],
  RSI: [{ key: 'period', label: 'Period', defaultValue: 14 }],
  ROC: [{ key: 'period', label: 'Period', defaultValue: 14 }],
  ATR: [{ key: 'period', label: 'Period', defaultValue: 14 }],
  ADX: [{ key: 'period', label: 'Period', defaultValue: 14 }],
  STD_DEV: [{ key: 'period', label: 'Period', defaultValue: 20 }],
  VOLUME_MA: [{ key: 'period', label: 'Period', defaultValue: 20 }],
  WILLIAMS_R: [{ key: 'period', label: 'Period', defaultValue: 14 }],
  MACD: [
    { key: 'fast_period', label: 'Fast Period', defaultValue: 12 },
    { key: 'slow_period', label: 'Slow Period', defaultValue: 26 },
    { key: 'signal_period', label: 'Signal Period', defaultValue: 9 },
  ],
  BOLLINGER_BANDS: [
    { key: 'period', label: 'Period', defaultValue: 20 },
    { key: 'std_dev_multiplier', label: 'Std Dev Multiplier', defaultValue: 2 },
  ],
  STOCHASTIC: [
    { key: 'k_period', label: 'K Period', defaultValue: 14 },
    { key: 'd_period', label: 'D Period', defaultValue: 3 },
  ],
};

export function getIndicatorParamFields(valueParam: string): IndicatorParamField[] {
  return INDICATOR_PARAM_FIELDS[valueParam.toUpperCase()] ?? [];
}

export function buildDefaultIndicatorParams(valueParam: string): Record<string, number> {
  const fields = getIndicatorParamFields(valueParam);
  return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue]));
}
