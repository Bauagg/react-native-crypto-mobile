import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type ErrorStateVariant = 'notFound' | 'serverError' | 'networkError' | 'generic';

type VariantContent = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  message: string;
};

const VARIANT_CONTENT: Record<ErrorStateVariant, VariantContent> = {
  notFound: {
    icon: 'search-outline',
    iconColor: '#9333EA',
    iconBg: '#F3E8FF',
    title: 'Halaman Tidak Ditemukan',
    message: 'Data yang kamu cari sepertinya sudah dipindahkan atau tidak tersedia.',
  },
  serverError: {
    icon: 'server-outline',
    iconColor: '#DC2626',
    iconBg: '#FEE2E2',
    title: 'Server Sedang Bermasalah',
    message: 'Terjadi kesalahan di server kami. Coba lagi dalam beberapa saat.',
  },
  networkError: {
    icon: 'cloud-offline-outline',
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    title: 'Tidak Ada Koneksi',
    message: 'Periksa koneksi internet kamu lalu coba lagi.',
  },
  generic: {
    icon: 'alert-circle-outline',
    iconColor: '#5B6672',
    iconBg: '#F1F4F8',
    title: 'Terjadi Kesalahan',
    message: 'Sesuatu tidak berjalan sebagaimana mestinya. Silakan coba lagi.',
  },
};

/** Tentukan varian ErrorState dari status HTTP / jenis error axios-network. */
export function getErrorStateVariant(status?: number, isNetworkError?: boolean): ErrorStateVariant {
  if (isNetworkError || status === undefined || status === 0) return 'networkError';
  if (status === 404) return 'notFound';
  if (status >= 500) return 'serverError';
  return 'generic';
}

export function ErrorState({
  variant = 'generic',
  title,
  message,
  onRetry,
  retryLabel = 'Coba Lagi',
}: {
  variant?: ErrorStateVariant;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const content = VARIANT_CONTENT[variant];

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: content.iconBg }]}>
        <Ionicons name={content.icon} size={40} color={content.iconColor} />
      </View>
      <Text style={styles.title}>{title ?? content.title}</Text>
      <Text style={styles.message}>{message ?? content.message}</Text>

      {onRetry ? (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={16} color="#fff" />
          <Text style={styles.retryButtonText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 6,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#11181C',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#5B6672',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2F6BFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
