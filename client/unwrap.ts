import type { ApiResponse } from '@/utils/api/api';

/** Error dari BE; `status` dipakai UI untuk memilih tampilan ErrorState. */
export type ApiError = Error & { status?: number };

export function createApiError(message: string, status?: number): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
}

/** Lempar ApiError kalau request gagal, supaya React Query menandainya sebagai error. */
export function unwrap<T>(res: ApiResponse<T>, fallbackMessage: string): ApiResponse<T> {
  if (!res.success) throw createApiError(res.message || fallbackMessage, res.status);
  return res;
}

/** Sama seperti `unwrap`, tapi `data` kosong juga dianggap error. */
export function unwrapData<T>(res: ApiResponse<T>, fallbackMessage: string): T {
  const { data } = unwrap(res, fallbackMessage);
  if (data === null) throw createApiError(fallbackMessage, res.status);
  return data;
}
