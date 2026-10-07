import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { AccountMode } from '@/client/transactions/types';
import { palette } from '@/components/home/palette';

export function HistoryEmpty({ mode, filtered }: { mode: AccountMode; filtered: boolean }) {
  const label = mode === 'DEMO' ? 'demo' : 'live';

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={filtered ? 'search-outline' : 'receipt-outline'}
          size={28}
          color={palette.accent}
        />
      </View>
      <Text style={styles.title}>
        {filtered ? 'Tidak ada transaksi yang cocok' : `Belum ada riwayat ${label}`}
      </Text>
      <Text style={styles.text}>
        {filtered
          ? 'Coba ubah kata kunci pencarian atau filter yang dipilih.'
          : `Transaksi ${label} yang sudah selesai akan tampil di sini setelah posisi ditutup.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 8,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  text: {
    fontSize: 13,
    lineHeight: 19,
    color: palette.subtle,
    textAlign: 'center',
  },
});
