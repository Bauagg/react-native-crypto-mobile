import { palette } from './palette';

export function getStatusInfo(status: string) {
  switch (status) {
    case 'active':
      return { label: 'Akun Aktif', color: palette.success };
    case 'blocked':
      return { label: 'Akun Diblokir', color: palette.danger };
    case 'pending':
      return { label: 'Menunggu Verifikasi', color: '#D97706' };
    default:
      return { label: status, color: palette.subtle };
  }
}
