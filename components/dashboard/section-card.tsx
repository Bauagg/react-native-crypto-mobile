import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/components/home/palette';

/** Kartu putih dengan judul bagian, dipakai semua bagian dasbor. */
export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 14,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.ink,
  },
  subtitle: {
    fontSize: 11,
    color: palette.subtle,
  },
});
