import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/components/home/palette';

/** Dropdown ringkas untuk memilih satu opsi dari daftar pendek (filter/urutan), tanpa kolom cari. */
export function SelectDropdown<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  /** Judul kecil di atas nilai terpilih, juga dipakai sebagai judul daftar pilihan. */
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  const handleSelect = (next: T) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setIsOpen(true)}>
        <Ionicons name={icon} size={18} color={palette.accent} />
        <View style={styles.triggerText}>
          <Text style={styles.triggerLabel}>{label}</Text>
          <Text style={styles.triggerValue} numberOfLines={1}>
            {selected?.label ?? '-'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={palette.subtle} />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>{label}</Text>

              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    style={styles.option}
                    onPress={() => handleSelect(option.value)}>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                    {isSelected ? <Ionicons name="checkmark" size={18} color={palette.accent} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: palette.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  triggerText: {
    flex: 1,
    gap: 1,
  },
  triggerLabel: {
    fontSize: 10,
    color: palette.subtle,
  },
  triggerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.ink,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(11, 18, 32, 0.4)',
  },
  sheet: {
    backgroundColor: palette.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.border,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
    marginBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  optionText: {
    fontSize: 15,
    color: palette.ink,
  },
  optionTextSelected: {
    color: palette.accent,
    fontWeight: '700',
  },
});
