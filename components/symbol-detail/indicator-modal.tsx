import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFlexParams } from '@/client/flex_params/hooks';
import { useAlert } from '@/components/global/alert-provider';
import { palette } from '@/components/home/palette';

import { buildDefaultIndicatorParams, getIndicatorParamFields } from './indicator-params';
import { ApiRequestError, useUserIndicators, type UserIndicator } from './use-user-indicators';

function describeError(error: unknown): { title: string; message: string } {
  if (error instanceof ApiRequestError) {
    const statusLabel = error.status ? `[${error.status}] ` : '';
    const fieldDetail = error.fieldErrors?.length
      ? '\n' + error.fieldErrors.map((fe) => `- ${fe.field}: ${fe.message}`).join('\n')
      : '';
    return { title: 'Gagal Menyimpan Indikator', message: `${statusLabel}${error.message}${fieldDetail}` };
  }
  return {
    title: 'Gagal Menyimpan Indikator',
    message: error instanceof Error ? error.message : 'Terjadi kesalahan',
  };
}

export interface IndicatorOption {
  id: string;
  label: string;
  description: string;
}

export function useIndicatorOptions() {
  const query = useFlexParams('INDICATORS');

  const options: IndicatorOption[] =
    query.data?.map((item) => ({
      id: item.id,
      label: item.value_param,
      description: item.description ?? '',
    })) ?? [];

  return { options, isLoading: query.isLoading, isError: query.isError };
}

// Satu draft indikator baru yang belum dikirim ke backend (pending di sesi modal ini).
interface DraftInstance {
  draftId: string;
  indicatorType: string;
  values: Record<string, string>;
}

function ParamFields({
  fields,
  values,
  onChangeField,
  onBlurField,
}: {
  fields: { key: string; label: string; defaultValue: number }[];
  values: Record<string, string>;
  onChangeField: (key: string, text: string) => void;
  onBlurField?: (key: string, text: string) => void;
}) {
  if (fields.length === 0) return null;
  return (
    <View style={styles.paramRow}>
      {fields.map((field) => (
        <View key={field.key} style={styles.paramField}>
          <Text style={styles.paramLabel}>{field.label}</Text>
          <TextInput
            value={values[field.key] ?? String(field.defaultValue)}
            onChangeText={(text) => onChangeField(field.key, text)}
            onBlur={() => onBlurField?.(field.key, values[field.key] ?? '')}
            keyboardType="numeric"
            style={styles.paramInput}
            placeholder={String(field.defaultValue)}
            placeholderTextColor="#9AA3AC"
          />
        </View>
      ))}
    </View>
  );
}

export function IndicatorModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { options, isLoading: isOptionsLoading, isError: isOptionsError } = useIndicatorOptions();
  const {
    indicators,
    isLoading: isIndicatorsLoading,
    createBulk,
    update,
    remove,
  } = useUserIndicators();
  const { showError, showSuccess } = useAlert();

  // Instance baru yang ditambahkan lewat tombol "+ Tambah" di sesi modal ini, belum tersimpan.
  const [drafts, setDrafts] = useState<DraftInstance[]>([]);
  // Draft angka untuk instance yang SUDAH tersimpan (langsung PUT saat blur).
  const [editDrafts, setEditDrafts] = useState<Record<string, Record<string, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Buang draft saat modal ditutup. Disesuaikan saat render (bukan di useEffect) sesuai anjuran React.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (!visible) {
      setDrafts([]);
      setEditDrafts({});
    }
  }

  const isLoading = isOptionsLoading || isIndicatorsLoading;

  const findSavedInstances = (label: string) =>
    indicators.filter((item) => item.indicator_type === label && item.is_active);

  const handleAddInstance = (option: IndicatorOption) => {
    setDrafts((prev) => [
      ...prev,
      {
        draftId: `${option.label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        indicatorType: option.label,
        values: Object.fromEntries(
          Object.entries(buildDefaultIndicatorParams(option.label)).map(([key, value]) => [
            key,
            String(value),
          ])
        ),
      },
    ]);
  };

  const handleRemoveDraft = (draftId: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.draftId !== draftId));
  };

  const handleRemoveSaved = async (id: string) => {
    setRemovingId(id);
    try {
      await remove(id);
    } catch (error) {
      showError({
        title: 'Gagal Menghapus Indikator',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleParamBlur = async (active: UserIndicator, key: string, text: string) => {
    const numeric = Number(text);
    if (!Number.isFinite(numeric)) return;
    if (active.params[key] === numeric) return;
    try {
      await update({ id: active.id, params: { ...active.params, [key]: numeric } });
    } catch (error) {
      showError({
        title: 'Gagal Menyimpan Parameter',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  };

  const handleSaveDrafts = async () => {
    if (drafts.length === 0) return;
    setIsSaving(true);
    try {
      await createBulk(
        drafts.map((draft) => ({
          indicator_type: draft.indicatorType,
          params: Object.fromEntries(
            Object.entries(draft.values).map(([key, text]) => [key, Number(text) || 0])
          ),
        }))
      );
      setDrafts([]);
      showSuccess({ title: 'Berhasil', message: 'Indikator berhasil ditambahkan' });
    } catch (error) {
      console.error('[user-indicators/bulk] gagal:', error);
      showError({ ...describeError(error), duration: 6000 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheetInner}>
            <View style={styles.sheetHandle} />

            <View style={styles.headerRow}>
              <Text style={styles.title}>Indikator</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={22} color={palette.subtle} />
              </Pressable>
            </View>
            <Text style={styles.subtitle}>
              Tambah indikator, boleh lebih dari satu untuk jenis yang sama (mis. SMA 20 dan SMA 50)
            </Text>

            {isLoading ? (
              <View style={styles.stateWrap}>
                <ActivityIndicator color={palette.accent} />
              </View>
            ) : isOptionsError ? (
              <View style={styles.stateWrap}>
                <Ionicons name="alert-circle-outline" size={20} color={palette.subtle} />
                <Text style={styles.stateText}>Gagal memuat daftar indikator.</Text>
              </View>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                  <View style={styles.stateWrap}>
                    <Text style={styles.stateText}>Belum ada indikator yang tersedia.</Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const savedInstances = findSavedInstances(item.label);
                  const draftInstances = drafts.filter((d) => d.indicatorType === item.label);
                  const fields = getIndicatorParamFields(item.label);
                  const totalCount = savedInstances.length + draftInstances.length;

                  return (
                    <View style={styles.optionWrap}>
                      <View style={styles.option}>
                        <View style={styles.optionText}>
                          <View style={styles.optionTitleRow}>
                            <Text style={styles.optionLabel}>{item.label}</Text>
                            {totalCount > 0 ? (
                              <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{totalCount}</Text>
                              </View>
                            ) : null}
                          </View>
                          {item.description ? (
                            <Text style={styles.optionDescription}>{item.description}</Text>
                          ) : null}
                        </View>
                        <Pressable
                          style={styles.addButton}
                          onPress={() => handleAddInstance(item)}
                          hitSlop={6}>
                          <Ionicons name="add" size={16} color={palette.accent} />
                          <Text style={styles.addButtonText}>Tambah</Text>
                        </Pressable>
                      </View>

                      {savedInstances.map((instance) => (
                        <View key={instance.id} style={styles.instanceRow}>
                          <View style={styles.instanceHeader}>
                            <Text style={styles.instanceLabel}>Tersimpan</Text>
                            <Pressable
                              onPress={() => handleRemoveSaved(instance.id)}
                              hitSlop={8}
                              disabled={removingId === instance.id}>
                              {removingId === instance.id ? (
                                <ActivityIndicator size="small" color={palette.subtle} />
                              ) : (
                                <Ionicons name="trash-outline" size={16} color={palette.down} />
                              )}
                            </Pressable>
                          </View>
                          <ParamFields
                            fields={fields}
                            values={{
                              ...Object.fromEntries(
                                Object.entries(instance.params).map(([key, value]) => [
                                  key,
                                  String(value),
                                ])
                              ),
                              ...editDrafts[instance.id],
                            }}
                            onChangeField={(key, text) => {
                              setEditDrafts((prev) => ({
                                ...prev,
                                [instance.id]: { ...prev[instance.id], [key]: text },
                              }));
                            }}
                            onBlurField={(key, text) => handleParamBlur(instance, key, text)}
                          />
                        </View>
                      ))}

                      {draftInstances.map((draft) => (
                        <View key={draft.draftId} style={[styles.instanceRow, styles.instanceRowDraft]}>
                          <View style={styles.instanceHeader}>
                            <Text style={styles.pendingLabel}>Belum disimpan</Text>
                            <Pressable onPress={() => handleRemoveDraft(draft.draftId)} hitSlop={8}>
                              <Ionicons name="close-circle-outline" size={16} color={palette.subtle} />
                            </Pressable>
                          </View>
                          <ParamFields
                            fields={fields}
                            values={draft.values}
                            onChangeField={(key, text) => {
                              setDrafts((prev) =>
                                prev.map((d) =>
                                  d.draftId === draft.draftId
                                    ? { ...d, values: { ...d.values, [key]: text } }
                                    : d
                                )
                              );
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  );
                }}
              />
            )}
          </View>

          {drafts.length > 0 ? (
            <View style={[styles.saveButtonWrap, { paddingBottom: insets.bottom || 12 }]}>
              <Pressable
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSaveDrafts}
                disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Simpan {drafts.length} Indikator</Text>
                )}
              </Pressable>
            </View>
          ) : null}
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
    maxHeight: '85%',
    flexDirection: 'column',
  },
  sheetInner: {
    flexShrink: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
    gap: 4,
  },
  list: {
    flexShrink: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.border,
    marginBottom: 8,
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
  subtitle: {
    fontSize: 12,
    color: palette.subtle,
    marginBottom: 8,
    lineHeight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: palette.border,
  },
  optionWrap: {
    paddingVertical: 8,
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.ink,
  },
  optionDescription: {
    fontSize: 12,
    color: palette.subtle,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#EAF0FF',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.accent,
  },
  instanceRow: {
    marginLeft: 4,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: palette.border,
    gap: 4,
  },
  instanceRowDraft: {
    borderLeftColor: palette.accent,
  },
  instanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.subtle,
    textTransform: 'uppercase',
  },
  pendingLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.accent,
    textTransform: 'uppercase',
  },
  paramRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 2,
  },
  paramField: {
    minWidth: 100,
    flexGrow: 1,
  },
  paramLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.subtle,
    marginBottom: 4,
  },
  paramInput: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: palette.ink,
    backgroundColor: palette.surface,
  },
  saveButtonWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: palette.card,
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: palette.accent,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  stateWrap: {
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  stateText: {
    fontSize: 13,
    color: palette.subtle,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
