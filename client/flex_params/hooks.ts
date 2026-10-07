import { useQuery } from '@tanstack/react-query';

import { getFlexParamsByType } from './api';
import type { Exchange, FlexParam, FlexParamType } from './types';

export const flexParamKeys = {
  byType: (type: FlexParamType) => ['flex-params', type] as const,
};

// Parameter jarang berubah, jadi tidak perlu diambil ulang tiap layar dibuka.
const STALE_TIME_MS = 5 * 60 * 1000;

/** Parameter aktif untuk satu type_param. */
export function useFlexParams(type: FlexParamType) {
  return useQuery({
    queryKey: flexParamKeys.byType(type),
    queryFn: () => getFlexParamsByType(type),
    staleTime: STALE_TIME_MS,
  });
}

function toExchanges(params: FlexParam[]): Exchange[] {
  return params.map((param) => ({
    value: param.value_param,
    label: param.description || param.value_param,
    logoUrl: param.photo_url,
  }));
}

/** Daftar exchange (TYPE_EXCENG) untuk pilihan platform di form API key. */
export function useExchanges() {
  // Key dan queryFn sama dengan useFlexParams, jadi cache dipakai bersama; `select` hanya memetakan.
  const query = useQuery({
    queryKey: flexParamKeys.byType('TYPE_EXCENG'),
    queryFn: () => getFlexParamsByType('TYPE_EXCENG'),
    staleTime: STALE_TIME_MS,
    select: toExchanges,
  });

  return {
    exchanges: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
