import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { AccountMode } from '@/client/transactions/types';
import { palette } from './palette';

export function AssetEmpty({ mode }: { mode: AccountMode }) {
  const label = mode === 'DEMO' ? 'demo' : 'live';

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="wallet-outline" size={28} color={palette.accent} />
      </View>
      <Text style={styles.title}>Belum ada aset {label}</Text>
      <Text style={styles.text}>
        Posisi {label} yang sedang terbuka akan tampil di sini setelah robot membeli coin.
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
