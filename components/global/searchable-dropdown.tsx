import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const palette = {
  accent: '#2F6BFF',
  ink: '#11181C',
  subtle: '#5B6672',
  border: '#E6E9EE',
  surface: '#F6F8FB',
  card: '#FFFFFF',
  danger: '#E5484D',
  overlay: 'rgba(17, 24, 28, 0.4)',
};

export type SearchableDropdownOption = {
  label: string;
  value: string;
  /** Logo kecil di sebelah label (opsional). */
  imageUrl?: string | null;
};

type SearchableDropdownProps = {
  label?: string;
  value: string;
  options: SearchableDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  emptyMessage?: string;
};

export function SearchableDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = 'Pilih salah satu',
  searchPlaceholder = 'Cari...',
  error,
  emptyMessage = 'Tidak ada hasil ditemukan',
}: SearchableDropdownProps) {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const normalized = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  const openDropdown = () => {
    setQuery('');
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setQuery('');
  };

  const handleSelect = (option: SearchableDropdownOption) => {
    onChange(option.value);
    closeDropdown();
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        onPress={openDropdown}
        style={[styles.trigger, error ? styles.triggerError : null]}>
        <View style={styles.labelWrap}>
          {selectedOption?.imageUrl ? (
            <Image source={{ uri: selectedOption.imageUrl }} style={styles.logo} contentFit="cover" />
          ) : null}
          <Text style={[styles.triggerText, !selectedOption && styles.triggerPlaceholder]}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={palette.subtle} />
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={closeDropdown}>
        <Pressable style={styles.overlay} onPress={closeDropdown}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.sheetInner, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.sheetHandle} />

              <View style={styles.searchWrap}>
                <Ionicons name="search" size={16} color={palette.subtle} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor="#9AA3AC"
                  style={styles.searchInput}
                  autoFocus
                  autoCapitalize="none"
                />
                {query.length > 0 ? (
                  <Pressable onPress={() => setQuery('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={palette.subtle} />
                  </Pressable>
                ) : null}
              </View>

              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value}
                keyboardShouldPersistTaps="handled"
                style={styles.list}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>{emptyMessage}</Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const isSelected = item.value === value;
                  return (
                    <Pressable
                      onPress={() => handleSelect(item)}
                      style={[styles.option, isSelected && styles.optionSelected]}>
                      <View style={styles.labelWrap}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={styles.logo} contentFit="cover" />
                        ) : null}
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {item.label}
                        </Text>
                      </View>
                      {isSelected ? (
                        <Ionicons name="checkmark" size={18} color={palette.accent} />
                      ) : null}
                    </Pressable>
                  );
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink,
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: palette.surface,
  },
  triggerError: {
    borderColor: palette.danger,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  triggerText: {
    fontSize: 15,
    color: palette.ink,
  },
  triggerPlaceholder: {
    color: '#9AA3AC',
  },
  errorText: {
    color: palette.danger,
    fontSize: 12,
    marginTop: 3,
  },

  overlay: {
    flex: 1,
    backgroundColor: palette.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  sheetInner: {
    paddingTop: 10,
    paddingHorizontal: 20,
    gap: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.border,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: palette.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: palette.ink,
    padding: 0,
  },
  list: {
    flexGrow: 0,
  },
  separator: {
    height: 1,
    backgroundColor: palette.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  optionSelected: {},
  optionText: {
    fontSize: 15,
    color: palette.ink,
  },
  optionTextSelected: {
    color: palette.accent,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: palette.subtle,
  },
});
