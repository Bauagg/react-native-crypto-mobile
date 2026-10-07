/**
 * type_param yang dikenal FE. Nama dipakai persis seperti di BE (termasuk TYPE_EXCENG,
 * bukan TYPE_EXCHANGE) karena dicocokkan langsung dengan data di tabel flex_params.
 */
export type FlexParamType = 'TYPE_EXCENG' | 'MATA_UANG' | 'INDICATORS';

/** Satu baris flex_params dari GET /flex-params/type/:type. */
export interface FlexParam {
  id: string;
  type_param: string;
  /** Nilai yang disimpan/dikirim ke BE, mis. "BINANCE". */
  value_param: string;
  /** Nama tampilan, mis. "Binance". */
  description: string | null;
  photo_url: string | null;
  is_active: boolean;
}

/** Exchange yang bisa dihubungkan user (type_param = TYPE_EXCENG). */
export interface Exchange {
  /** value_param, dipakai sebagai nilai `platform` di profil. */
  value: string;
  label: string;
  logoUrl: string | null;
}
