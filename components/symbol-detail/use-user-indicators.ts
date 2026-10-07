import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api, { type FieldError } from '@/utils/api/api';

export class ApiRequestError extends Error {
  status?: number;
  fieldErrors?: FieldError[];

  constructor(message: string, status?: number, fieldErrors?: FieldError[]) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export interface UserIndicator {
  id: string;
  user_id: string;
  flex_param_id: string;
  indicator_type: string;
  params: Record<string, number>;
  is_active: boolean;
}

const QUERY_KEY = ['user-indicators'];

export function useUserIndicators() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await api.get<UserIndicator[]>('user-indicators');
      if (!res.success || !res.data) throw new Error(res.message ?? 'Gagal mengambil indikator aktif');
      return res.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const createBulkMutation = useMutation({
    mutationFn: async (input: { indicator_type: string; params: Record<string, number> }[]) => {
      const result = await api.post<UserIndicator[]>('user-indicators/bulk', { indicators: input });
      if (!result.success) {
        throw new ApiRequestError(
          result.message ?? 'Gagal mengaktifkan indikator',
          result.status,
          result.fieldErrors
        );
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: async (input: { id: string; params: Record<string, number> }) => {
      const result = await api.put<UserIndicator>(`user-indicators/${input.id}`, {
        params: input.params,
      });
      if (!result.success) throw new Error(result.message ?? 'Gagal menyimpan parameter indikator');
      return result;
    },
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.delete(`user-indicators/${id}`);
      if (!result.success) throw new Error(result.message ?? 'Gagal menonaktifkan indikator');
      return result;
    },
    onSuccess: () => invalidate(),
  });

  return {
    indicators: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createBulk: createBulkMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isMutating:
      createBulkMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
