import { Ionicons } from '@expo/vector-icons';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { useExchanges } from '@/client/flex_params/hooks';
import {
  SearchableDropdown,
  type SearchableDropdownOption,
} from '@/components/global/searchable-dropdown';
import type { UserProfile } from '@/utils/auth/AuthService';

import { BotToggleRow } from './bot-toggle-row';
import { EditFormActions } from './edit-form-actions';
import { EditTrigger } from './edit-trigger';
import { FormField } from './form-field';
import { InfoRow } from './info-row';
import { maskApiKey } from './mask-api-key';
import { palette } from './palette';
import { SectionCard } from './section-card';

export type ExchangeForm = {
  platform: string;
  api_key: string;
  api_secret: string;
};

export function ExchangeSection({
  profile,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSubmit,
  isSaving,
  control,
  errors,
  isBotActive,
  isBotSaving,
  onToggleBot,
}: {
  profile: UserProfile;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  control: Control<ExchangeForm>;
  errors: FieldErrors<ExchangeForm>;
  isBotActive: boolean;
  isBotSaving: boolean;
  onToggleBot: (value: boolean) => void;
}) {
  // Pilihan exchange (TYPE_EXCENG) dari BE, lengkap dengan logo.
  const { exchanges, isLoading: isExchangesLoading, isError: isExchangesError } = useExchanges();

  const platformOptions: SearchableDropdownOption[] = exchanges.map((exchange) => ({
    label: exchange.label,
    value: exchange.value,
    imageUrl: exchange.logoUrl,
  }));

  const platformLabel = (value: string) =>
    exchanges.find((exchange) => exchange.value === value)?.label ?? value;

  return (
    <SectionCard
      title="Koneksi Exchange"
      action={
        !isEditing ? (
          <EditTrigger label={profile.platform ? 'Ubah' : 'Hubungkan'} onPress={onStartEdit} />
        ) : undefined
      }>
      {isEditing ? (
        <View style={styles.editForm}>
          <Controller
            control={control}
            name="platform"
            rules={{ required: 'Platform wajib dipilih' }}
            render={({ field: { onChange, value } }) => (
              <SearchableDropdown
                label="Platform"
                value={value}
                onChange={onChange}
                options={platformOptions}
                placeholder={isExchangesLoading ? 'Memuat daftar exchange...' : 'Pilih exchange'}
                searchPlaceholder="Cari exchange..."
                emptyMessage={
                  isExchangesError ? 'Daftar exchange gagal dimuat' : 'Tidak ada exchange tersedia'
                }
                error={errors.platform?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="api_key"
            rules={{ required: 'API Key wajib diisi' }}
            render={({ field: { onChange, value } }) => (
              <FormField
                label="API Key"
                value={value}
                onChangeText={onChange}
                placeholder="Masukkan API Key"
                autoCapitalize="none"
                error={errors.api_key?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="api_secret"
            render={({ field: { onChange, value } }) => (
              <FormField
                label="API Secret"
                value={value}
                onChangeText={onChange}
                placeholder={profile.api_key ? 'Kosongkan jika tidak diganti' : 'Masukkan API Secret'}
                autoCapitalize="none"
                secureTextEntry
                error={errors.api_secret?.message}
              />
            )}
          />

          <EditFormActions onCancel={onCancelEdit} onSave={onSubmit} isSaving={isSaving} />
        </View>
      ) : profile.platform ? (
        <View style={styles.infoList}>
          <InfoRow icon="link-outline" label="Platform" value={platformLabel(profile.platform)} />
          <InfoRow
            icon="key-outline"
            label="API Key"
            value={profile.api_key ? maskApiKey(profile.api_key) : '—'}
          />

          <View style={styles.divider} />

          <BotToggleRow
            icon="flash-outline"
            label="Robot Auto-Trading (Real)"
            activeDescription="Robot aktif, mengeksekusi trading otomatis di akun exchange asli."
            inactiveDescription="Robot nonaktif, tidak ada trading otomatis di akun asli."
            value={isBotActive}
            onValueChange={onToggleBot}
            disabled={isBotSaving}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="link-outline" size={20} color={palette.subtle} />
          <Text style={styles.emptyStateText}>Belum ada exchange yang terhubung ke akun ini.</Text>
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  editForm: {
    gap: 14,
  },
  infoList: {
    gap: 14,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  emptyStateText: {
    flex: 1,
    fontSize: 13,
    color: palette.subtle,
    lineHeight: 18,
  },
});
