import api from '@/utils/api/api';

import { unwrap } from '../unwrap';
import type { FlexParam, FlexParamType } from './types';

const MAX_PARAMS = 100;

/** GET /flex-params/type/:type: daftar parameter aktif untuk satu type_param. */
export async function getFlexParamsByType(type: FlexParamType) {
  const res = unwrap(
    await api.get<FlexParam[]>(`flex-params/type/${type}`, {
      is_active: true,
      limit: MAX_PARAMS,
    }),
    'Gagal mengambil parameter'
  );
  return res.data ?? [];
}
