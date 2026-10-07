import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/components/home/palette';

export interface TradingPlan {
  id: string;
  name: string;
  dailyLoss: number;
  dailyProfit: number;
  indicators: string[];
  description: string;
}

export function TradingPlanModal({
  visible,
  plans,
  selectedId,
  onSelect,
  onCreate,
  onClose,
}: {
  visible: boolean;
  plans: TradingPlan[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filteredPlans = useMemo(() => {
    if (!query.trim()) return plans;
    const normalized = query.trim().toLowerCase();
    return plans.filter((plan) => plan.name.toLowerCase().includes(normalized));
  }, [plans, query]);

  const closeAndReset = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeAndReset}>
      <Pressable style={styles.overlay} onPress={closeAndReset}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.sheetInner, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.headerRow}>
              <Text style={styles.title}>Trading Plan</Text>
              <Pressable onPress={closeAndReset} hitSlop={8}>
                <Ionicons name="close" size={22} color={palette.subtle} />
              </Pressable>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={16} color={palette.subtle} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Cari trading plan..."
                placeholderTextColor="#9AA3AC"
                style={styles.searchInput}
                autoCapitalize="none"
              />
              {query.length > 0 ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={palette.subtle} />
                </Pressable>
              ) : null}
            </View>

            <Pressable style={styles.createTrigger} onPress={onCreate}>
              <Ionicons name="add-circle" size={18} color={palette.accent} />
              <Text style={styles.createTriggerText}>Buat Trading Plan Baru</Text>
            </Pressable>

            <FlatList
              data={filteredPlans}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={20} color={palette.subtle} />
                  <Text style={styles.emptyStateText}>
                    {plans.length === 0
                      ? 'Kamu belum punya trading plan. Buat satu untuk mulai.'
                      : 'Tidak ada plan yang cocok dengan pencarian.'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSelected = item.id === selectedId;
                return (
                  <Pressable
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => onSelect(item.id)}>
                    <View style={styles.optionText}>
                      <Text style={styles.optionLabel}>{item.name}</Text>
                      <View style={styles.optionMetaRow}>
                        <Text style={[styles.optionMeta, { color: palette.down }]}>
                          -${item.dailyLoss.toFixed(2)}/hari
                        </Text>
                        <Text style={styles.optionMetaDivider}>•</Text>
                        <Text style={[styles.optionMeta, { color: palette.up }]}>
                          +${item.dailyProfit.toFixed(2)}/hari
                        </Text>
                      </View>
                      {item.description ? (
                        <Text style={styles.optionDescription} numberOfLines={1}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={20} color={palette.accent} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 32, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.ink,
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
  createTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  createTriggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.accent,
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
    gap: 12,
  },
  optionSelected: {},
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.ink,
  },
  optionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionMetaDivider: {
    fontSize: 12,
    color: palette.subtle,
  },
  optionDescription: {
    fontSize: 12,
    color: palette.subtle,
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: palette.subtle,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
