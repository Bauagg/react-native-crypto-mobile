import { Control, Controller, FieldErrors } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import type { UserProfile } from '@/utils/auth/AuthService';

import { BotToggleRow } from './bot-toggle-row';
import { EditFormActions } from './edit-form-actions';
import { EditTrigger } from './edit-trigger';
import { FormField } from './form-field';
import { InfoRow } from './info-row';
import { palette } from './palette';
import { SectionCard } from './section-card';

export type DemoBalanceForm = {
  demo_balance: string;
};

export const DEMO_BALANCE_MIN = 1;
export const DEMO_BALANCE_MAX = 100000;

function formatBalance(rawValue: string) {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return rawValue;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}

export function DemoBalanceSection({
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
  control: Control<DemoBalanceForm>;
  errors: FieldErrors<DemoBalanceForm>;
  isBotActive: boolean;
  isBotSaving: boolean;
  onToggleBot: (value: boolean) => void;
}) {
  return (
    <SectionCard
      title="Saldo Demo"
      action={!isEditing ? <EditTrigger label="Ubah" onPress={onStartEdit} /> : undefined}>
      {isEditing ? (
        <View style={styles.editForm}>
          <Controller
            control={control}
            name="demo_balance"
            rules={{
              required: 'Saldo demo wajib diisi',
              validate: (value) => {
                const numeric = Number(value);
                if (!Number.isFinite(numeric)) return 'Masukkan angka yang valid';
                if (numeric < DEMO_BALANCE_MIN || numeric > DEMO_BALANCE_MAX) {
                  return `Saldo demo harus antara ${DEMO_BALANCE_MIN} dan ${DEMO_BALANCE_MAX}`;
                }
                return true;
              },
            }}
            render={({ field: { onChange, value } }) => (
              <FormField
                label={`Nominal Saldo (${DEMO_BALANCE_MIN} - ${DEMO_BALANCE_MAX})`}
                value={value}
                onChangeText={onChange}
                placeholder="1000"
                keyboardType="decimal-pad"
                error={errors.demo_balance?.message}
              />
            )}
          />

          <EditFormActions onCancel={onCancelEdit} onSave={onSubmit} isSaving={isSaving} />
        </View>
      ) : (
        <View style={styles.infoList}>
          <InfoRow
            icon="wallet-outline"
            label="Saldo Demo"
            value={`$${formatBalance(profile.demo_balance)}`}
          />

          <View style={styles.divider} />

          <BotToggleRow
            icon="hardware-chip-outline"
            label="Robot Auto-Trading (Demo)"
            activeDescription="Robot aktif, mengeksekusi trading otomatis di akun demo."
            inactiveDescription="Robot nonaktif, tidak ada trading otomatis yang berjalan."
            value={isBotActive}
            onValueChange={onToggleBot}
            disabled={isBotSaving}
          />
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
});
