import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlert } from '@/components/global/alert-provider';
import { SearchableDropdown } from '@/components/global/searchable-dropdown';
import { palette } from '@/components/home/palette';
import { useIndicatorOptions } from '@/components/symbol-detail/indicator-modal';

type CreatePlanForm = {
  name: string;
  dailyLoss: string;
  dailyProfit: string;
  indicators: string[];
  description: string;
};

const defaultValues: CreatePlanForm = {
  name: '',
  dailyLoss: '',
  dailyProfit: '',
  indicators: [],
  description: '',
};

export default function CreateTradingPlanScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ symbol?: string }>();
  const { showInfo } = useAlert();
  const { options: indicatorOptions } = useIndicatorOptions();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePlanForm>({ defaultValues });

  const onSubmit = (data: CreatePlanForm) => {
    router.replace({
      pathname: '/symbol/[symbol]',
      params: {
        symbol: params.symbol ?? '',
        newPlanName: data.name.trim(),
        newPlanDailyLoss: data.dailyLoss.trim(),
        newPlanDailyProfit: data.dailyProfit.trim(),
        newPlanIndicators: data.indicators.join(','),
        newPlanDescription: data.description.trim(),
      },
    });
  };

  const onTestPlan = () => {
    showInfo({
      title: 'Fitur Tes Segera Hadir',
      message: 'Simulasi trading plan belum tersedia, tapi datamu sudah lengkap dan valid.',
    });
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={palette.ink} />
        </Pressable>
        <Text style={styles.title}>Buat Trading Plan</Text>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        enableOnAndroid
        extraScrollHeight={20}>
        <Controller
          control={control}
          name="name"
          rules={{ required: 'Nama plan wajib diisi' }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nama Plan</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="mis. Swing Trade BTC"
                placeholderTextColor="#9AA3AC"
                style={[styles.input, errors.name && styles.inputError]}
                autoFocus
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="dailyLoss"
          rules={{
            required: 'Batas rugi harian wajib diisi',
            validate: (value) =>
              (Number.isFinite(Number(value)) && Number(value) > 0) || 'Masukkan angka lebih dari 0',
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Batas Rugi Harian (USD)</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="mis. 50"
                placeholderTextColor="#9AA3AC"
                keyboardType="decimal-pad"
                style={[styles.input, errors.dailyLoss && styles.inputError]}
              />
              {errors.dailyLoss ? (
                <Text style={styles.errorText}>{errors.dailyLoss.message}</Text>
              ) : (
                <Text style={styles.hint}>Batas rugi maksimum yang ditoleransi per hari.</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="dailyProfit"
          rules={{
            required: 'Target profit harian wajib diisi',
            validate: (value) =>
              (Number.isFinite(Number(value)) && Number(value) > 0) || 'Masukkan angka lebih dari 0',
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Target Profit Harian (USD)</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="mis. 100"
                placeholderTextColor="#9AA3AC"
                keyboardType="decimal-pad"
                style={[styles.input, errors.dailyProfit && styles.inputError]}
              />
              {errors.dailyProfit ? (
                <Text style={styles.errorText}>{errors.dailyProfit.message}</Text>
              ) : (
                <Text style={styles.hint}>Target profit yang ingin dicapai per hari.</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="indicators"
          rules={{ validate: (value) => value.length > 0 || 'Pilih minimal 1 indikator' }}
          render={({ field: { onChange, value } }) => {
            const availableOptions = indicatorOptions
              .filter((option) => !value.includes(option.id))
              .map((option) => ({ label: option.label, value: option.id }));

            return (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Indikator yang Dipakai</Text>
                <SearchableDropdown
                  value=""
                  options={availableOptions}
                  onChange={(id) => onChange([...value, id])}
                  placeholder="Tambah indikator..."
                  searchPlaceholder="Cari indikator..."
                  emptyMessage="Semua indikator sudah dipilih"
                  error={errors.indicators?.message}
                />

                {value.length > 0 ? (
                  <View style={styles.chipWrap}>
                    {value.map((id) => {
                      const option = indicatorOptions.find((item) => item.id === id);
                      if (!option) return null;
                      return (
                        <View key={id} style={styles.selectedChip}>
                          <Text style={styles.selectedChipText}>{option.label}</Text>
                          <Pressable
                            onPress={() => onChange(value.filter((item) => item !== id))}
                            hitSlop={6}>
                            <Ionicons name="close" size={14} color={palette.accent} />
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.hint}>Boleh pilih lebih dari satu indikator.</Text>
                )}
              </View>
            );
          }}
        />

        <Controller
          control={control}
          name="description"
          rules={{ required: 'Deskripsi strategi wajib diisi' }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Deskripsi Strategi</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Jelaskan strategi trading plan ini, kapan entry, kapan exit, dsb."
                placeholderTextColor="#9AA3AC"
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                multiline
                numberOfLines={5}
              />
              {errors.description ? (
                <Text style={styles.errorText}>{errors.description.message}</Text>
              ) : null}
            </View>
          )}
        />

        <Pressable style={styles.testButton} onPress={handleSubmit(onTestPlan)}>
          <Ionicons name="play-circle-outline" size={18} color={palette.accent} />
          <Text style={styles.testButtonText}>Simulasikan Plan</Text>
        </Pressable>

        <Pressable style={styles.saveButton} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.saveButtonText}>Simpan Trading Plan</Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.ink,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  fieldContainer: {},
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: palette.ink,
    backgroundColor: palette.card,
  },
  inputError: {
    borderColor: palette.down,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: palette.subtle,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: palette.down,
    marginTop: 4,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: palette.accent,
    backgroundColor: '#EAF0FF',
  },
  selectedChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.accent,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: palette.accent,
    backgroundColor: palette.card,
    marginTop: 8,
  },
  testButtonText: {
    color: palette.accent,
    fontWeight: '700',
    fontSize: 15,
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: palette.accent,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
