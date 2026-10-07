import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/components/home/palette';

/** Satu baris label di kiri dan nilai di kanan untuk kartu rincian. */
export function DetailRow({
  label,
  value,
  valueColor,
  hint,
}: {
  label: string;
  value: string;
  valueColor?: string;
  hint?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueWrap}>
        <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
    </View>
  );
}

export function RowDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 9,
  },
  label: {
    fontSize: 13,
    color: palette.subtle,
    flexShrink: 0,
  },
  valueWrap: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.ink,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  hint: {
    fontSize: 10,
    color: palette.subtle,
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border,
  },
});
