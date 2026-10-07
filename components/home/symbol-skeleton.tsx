import { StyleSheet, View } from 'react-native';

import { palette } from './palette';

export function SymbolSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.leading}>
        <View style={styles.icon} />
        <View style={styles.textBlock}>
          <View style={[styles.bar, { width: 56 }]} />
        </View>
      </View>
      <View style={styles.trailing}>
        <View style={[styles.bar, { width: 72 }]} />
        <View style={[styles.bar, { width: 48, height: 16 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.surface,
  },
  textBlock: {
    gap: 6,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 6,
  },
  bar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.surface,
  },
});
