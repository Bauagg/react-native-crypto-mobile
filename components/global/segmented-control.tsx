import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/components/home/palette';

/** Pilihan satu dari beberapa opsi pendek dalam satu pil (mis. Demo/Live, USDT/IDR). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.item, active && styles.itemActive]}
            onPress={() => onChange(option.value)}>
            <Text style={[styles.text, active && styles.textActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    padding: 3,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  itemActive: {
    backgroundColor: palette.accent,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.subtle,
  },
  textActive: {
    color: '#fff',
  },
});
